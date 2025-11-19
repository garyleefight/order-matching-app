# Auto-Approval Feature

## Overview

The order-matching application now includes an **intelligent auto-approval system** that automatically processes high-confidence transaction matches, significantly reducing manual review workload.

## How It Works

### Auto-Approval Criteria

Transactions are automatically approved if they meet BOTH conditions:

1. **Core Field Match Score ≥ 90%**
   - Core fields: Customer Name (30%) + Order ID (35%) + Item Name (20%) = 85 points max
   - Threshold: 76.5 out of 85 points (90% of maximum)
   - Price and Date fields do NOT count toward auto-approval threshold

2. **Matched Order Exists in Database**
   - The order must already be saved in the `orders` table
   - Ensures transactions can only be auto-approved against valid, existing orders

### What Happens When Auto-Approved

When a transaction meets the auto-approval criteria:

1. **Saved to `transactions` table** - Immediately available as an approved transaction
2. **Saved to `pending_transactions` table** with `status='approved'` - Maintains complete audit trail
3. **Counter incremented** - Response includes `autoApprovedCount`

### Example Scores

**Will be Auto-Approved** (90%+ core score):
- Customer: "Alex Abel" vs "Alex Abel" = 30/30
- Order ID: "18G" vs "18G" = 35/35
- Item: "Tool A" vs "Tool A" = 20/20
- **Core Score: 85/85 (100%)** ✅ AUTO-APPROVED

**Will Need Manual Review** (below 90% core score):
- Customer: "Alex Abel" vs "Alexis Abe" = 22/30
- Order ID: "18G" vs "1B6" = 20/35
- Item: "Tool A" vs "Tool A" = 20/20
- **Core Score: 62/85 (73%)** ⏳ PENDING REVIEW

## Implementation Details

### Backend Changes

**File: `backend/src/matcher.ts`**
- Added `shouldAutoApprove(order, transaction)` function
- Calculates core score (customer + orderId + item)
- Returns true if core score ≥ 76.5 points

**File: `backend/src/controllers/match.controller.ts`**
- Checks each matched transaction for auto-approval
- If approved: saves to both `transactions` and `pending_transactions` tables
- If not approved: saves only to `pending_transactions` with status='pending'
- Returns counts: `autoApprovedCount`, `pendingCount`, `rejectedCount`

### API Response

The `/api/match` endpoint now returns:

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

## Benefits

1. **Reduced Manual Work** - High-confidence matches process automatically
2. **Faster Processing** - No delay waiting for manual approval
3. **Complete Audit Trail** - All transactions recorded in `pending_transactions`
4. **Risk Mitigation** - Only near-perfect matches are auto-approved
5. **Flexibility** - 90% threshold can be adjusted in `matcher.ts`

## Configuration

To adjust the auto-approval threshold:

**File: `backend/src/matcher.ts`**
```typescript
const AUTO_APPROVE_THRESHOLD = 0.9; // 90% of core fields

// Change to 0.95 for stricter (95% required)
// Change to 0.85 for more lenient (85% required)
```

## Testing

### Test Auto-Approval

```bash
# Add an order first
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '[{"customer":"Alex Abel","orderId":"18G","date":"2023-07-11","item":"Tool A","price":1.23}]'

# Match with perfect transaction (should auto-approve)
curl -X POST http://localhost:8080/api/match \
  -H "Content-Type: application/json" \
  -d '{"orders":[{"customer":"Alex Abel","orderId":"18G","date":"2023-07-11","item":"Tool A","price":1.23}],"transactions":[{"customer":"Alex Abel","orderId":"18G","date":"2023-07-12","item":"Tool A","price":1.23,"txnType":"payment","txnAmount":1.23}]}'

# Check auto-approved transaction in transactions table
curl http://localhost:8080/api/transactions

# Verify audit trail in pending_transactions
curl http://localhost:8080/api/pending-transactions?status=approved
```

### Test Manual Review Path

```bash
# Match with imperfect transaction (should go to pending)
curl -X POST http://localhost:8080/api/match \
  -H "Content-Type: application/json" \
  -d '{"orders":[{"customer":"Alex Abel","orderId":"18G","date":"2023-07-11","item":"Tool A","price":1.23}],"transactions":[{"customer":"Alexis Abe","orderId":"1B6","date":"2023-07-12","item":"Tool A","price":1.23,"txnType":"payment","txnAmount":1.23}]}'

# Check pending transactions
curl http://localhost:8080/api/pending-transactions?status=pending
```

## Security Considerations

- Auto-approval only occurs if the matched order exists in the database
- Fields like price and date can still have errors in auto-approved transactions
- The 90% threshold balances automation with safety
- All auto-approved transactions remain visible in the pending_transactions table for audit

## Future Enhancements

- Configurable threshold per customer or order type
- ML-based dynamic threshold adjustment
- Alert notifications for auto-approved transactions above certain amounts
- Batch approval reports
- Dashboard showing auto-approval statistics

## Audit Trail

Every auto-approved transaction creates TWO database records:

1. **`transactions` table** - The approved, active transaction
2. **`pending_transactions` table** (status='approved') - The audit record with match score

This ensures complete traceability of all automated decisions.
