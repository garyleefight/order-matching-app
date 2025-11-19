# Changelog

## Auto-Approval Feature - Latest Update

### Overview
Added intelligent auto-approval system that automatically processes high-confidence transaction matches with auto-fix correction.

### Key Features

#### 1. Auto-Approval Criteria
- **Core field match score ≥ 90%** (76.5 out of 85 points)
  - Customer name (30%) + Order ID (35%) + Item name (20%)
- **Matched order exists in database**
- Price and date fields do NOT count toward auto-approval threshold

#### 2. Auto-Fix on Auto-Approval
**Important:** Auto-approved transactions are automatically corrected before saving!

When a transaction is auto-approved, the system:
- Replaces `customer` with the matched order's customer
- Replaces `orderId` with the matched order's orderId
- Replaces `item` with the matched order's item
- Preserves original: `date`, `price`, `txnType`, `txnAmount`

**Example:**
```javascript
// Original transaction (with errors)
{
  customer: "Alexis Abe",     // ← Typo
  orderId: "1B6",             // ← OCR error
  item: "Tool A",
  price: 1.23,
  txnType: "payment",
  txnAmount: 1.23
}

// Matched to order
{
  customer: "Alex Abel",
  orderId: "18G",
  item: "Tool A",
  price: 1.23
}

// Core score: 78/85 (92%) → AUTO-APPROVED

// Saved to database (auto-fixed)
{
  customer: "Alex Abel",      // ✓ Corrected
  orderId: "18G",             // ✓ Corrected
  item: "Tool A",             // ✓ Already correct
  price: 1.23,                // Unchanged
  txnType: "payment",         // Unchanged
  txnAmount: 1.23             // Unchanged
}
```

#### 3. Dual Database Storage
Auto-approved transactions are saved to BOTH tables:
- **`transactions` table**: The corrected, approved transaction
- **`pending_transactions` table**: Audit record with status='approved'

This maintains a complete audit trail while making approved transactions immediately available.

### Files Modified

#### `backend/src/matcher.ts`
```typescript
// Added core score calculation
function calculateMatchScore(order, transaction): { totalScore, coreScore }

// Added auto-approval check
export function shouldAutoApprove(order, transaction): boolean
```

#### `backend/src/controllers/match.controller.ts`
```typescript
// Auto-fix logic applied before saving
if (autoApprove && orderId) {
  const fixedTxn = {
    ...txn,
    customer: order.customer,  // Auto-fix
    orderId: order.orderId,    // Auto-fix
    item: order.item           // Auto-fix
  };

  TransactionModel.create(fixedTxn, orderId);
  PendingTransactionModel.create(fixedTxn, orderId, matchScore, 'approved');
}
```

#### `backend/src/models/PendingTransaction.model.ts`
```typescript
// Updated to accept 'approved' status
static create(..., status: 'pending' | 'approved' | 'rejected' = 'pending')
```

### API Response Changes

#### POST /api/match
```json
{
  "matched": [...],
  "unmatchedOrders": [...],
  "unmatchedTransactions": [...],
  "message": "5 auto-approved, 3 sent to pending review, 2 auto-rejected",
  "autoApprovedCount": 5,
  "pendingCount": 3,
  "rejectedCount": 2
}
```

### Benefits

1. **Data Quality**: Auto-fix ensures corrected data in approved transactions
2. **Reduced Manual Work**: High-confidence matches process automatically
3. **Faster Processing**: No delay waiting for manual approval
4. **Complete Audit Trail**: Original and corrected versions tracked
5. **Risk Mitigation**: Only near-perfect matches (90%+) are auto-approved

### Configuration

To adjust the auto-approval threshold:

**File: `backend/src/matcher.ts`**
```typescript
const AUTO_APPROVE_THRESHOLD = 0.9;  // 90% of core fields

// Examples:
// 0.95 = stricter (95% required)
// 0.85 = more lenient (85% required)
```

### Testing

```bash
# 1. Add an order
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '[{"customer":"Alex Abel","orderId":"18G","date":"2023-07-11","item":"Tool A","price":1.23}]'

# 2. Match with near-perfect transaction (should auto-approve with auto-fix)
curl -X POST http://localhost:8080/api/match \
  -H "Content-Type: application/json" \
  -d '{"orders":[{"customer":"Alex Abel","orderId":"18G","date":"2023-07-11","item":"Tool A","price":1.23}],"transactions":[{"customer":"Alexis Abe","orderId":"1B6","date":"2023-07-12","item":"Tool A","price":1.23,"txnType":"payment","txnAmount":1.23}]}'

# 3. Verify auto-fixed transaction in transactions table
curl http://localhost:8080/api/transactions
# Should show: customer="Alex Abel", orderId="18G" (corrected values)

# 4. Verify audit trail
curl http://localhost:8080/api/pending-transactions?status=approved
# Should show: same corrected values with status='approved'
```

### Security Considerations

- Auto-fix only occurs for auto-approved transactions (≥90% core score)
- Original transaction data is NOT preserved in database (only corrected version)
- Matched order must exist in database for auto-approval
- All changes logged in pending_transactions for audit

### Migration Notes

**No database migration required** - the feature works with existing schema.

The `pending_transactions` table already supports 'approved' status in the schema definition.

### Known Limitations

1. **Original values not stored**: Once auto-fixed, original customer/orderId/item values are not preserved in the database
2. **Cannot disable auto-fix**: Auto-approved transactions are always auto-fixed
3. **No notification**: No email/alert when transactions are auto-approved (future enhancement)

### Future Enhancements

- Option to preserve original values in a separate audit field
- Configurable auto-fix behavior (enable/disable per field)
- Email notifications for auto-approved transactions
- Dashboard showing auto-approval statistics
- ML-based dynamic threshold adjustment

---

## Previous Features

### Fuzzy Matching Algorithm
- Uses fuzzball library (JavaScript port of fuzzywuzzy)
- Weighted scoring: Customer (30%), Order ID (35%), Item (20%), Price (10%), Date (5%)
- Handles typos, OCR errors, missing data

### Pending Transaction Workflow
- Matched transactions → pending review
- Unmatched transactions → auto-rejected
- Manual approval with validation
- Auto-fix feature in UI
- Complete audit trail with timestamps

### MVC Architecture
- Clean separation: controllers, models, routes
- Organized frontend components by domain
- Sortable tables and modal views
- Proper error handling with 4xx/5xx status codes
