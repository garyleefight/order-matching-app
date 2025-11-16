# Order-Transaction Matching Application

A full-stack web application that intelligently matches orders with transactions using fuzzy matching algorithms to handle data entry errors from manual recording (audio/pen and paper).

## Features

### Core Functionality
- **Fuzzy Matching Algorithm**: Uses the `fuzzball` library (JavaScript port of Python's fuzzywuzzy) to match orders with transactions despite typos and data entry errors
- **Weighted Scoring System**:
  - Customer name: 30%
  - Order ID: 35%
  - Item: 20%
  - Price: 10%
  - Date validity: 5%
- **Handles Common Errors**:
  - Name variations ("Brian Bell" vs "Bryan Ball" vs "Brian Ball")
  - OCR-like errors in IDs ("18G" vs "I8G" vs "1B6")
  - Missing fields
  - Date discrepancies

### Workflow
1. **Manage Orders**: Import orders via JSON file/paste or add manually one by one
2. **Import & Match Transactions**: Upload transactions as JSON or add manually - automatically matches against orders
3. **Review Pending Transactions**: View matched transactions with scores, auto-fix mismatches, approve or reject
4. **Manage Transactions**: View all approved transactions with order details
5. **Auto-Rejection**: Unmatched transactions are automatically rejected and saved for audit trail

### Technical Highlights
- **Pending Transactions System**: Matched transactions saved to `pending_transactions` table for review
- **Auto-Fix Functionality**: One-click alignment of transaction fields with matched orders
- **Status Tracking**: pending → approved/rejected with timestamps
- **Approval Validation**: Prevents approval if customer, orderId, or item don't match the matched order
- **Complete Audit Trail**: All transactions (matched and rejected) are persisted
- **MVC Architecture**: Clean separation with controllers, models, and services
- **Organized Components**: Components grouped by domain (order, transaction, pendingTransaction, modal)
- **Sortable Tables**: Click headers to sort by any column
- **Modal Views**: Clean UI for viewing/editing order and transaction details

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite with better-sqlite3
- **Fuzzy Matching**: fuzzball
- **Architecture**: MVC pattern with controllers and models

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Custom CSS with responsive design
- **UI Components**: Reusable modal, sortable table, detail views

## Project Structure

```
order-matching-app/
├── backend/
│   ├── src/
│   │   ├── controllers/          # MVC Controllers
│   │   │   ├── match.controller.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── transaction.controller.ts
│   │   │   └── pendingTransaction.controller.ts
│   │   ├── models/               # Database models
│   │   │   ├── Order.model.ts
│   │   │   ├── Transaction.model.ts
│   │   │   └── PendingTransaction.model.ts
│   │   ├── db/
│   │   │   └── database.ts       # Database initialization and schema
│   │   ├── middleware/
│   │   │   └── errorHandler.ts   # Error handling middleware
│   │   ├── routes/
│   │   │   └── api.routes.ts     # API route definitions
│   │   ├── matcher.ts            # Fuzzy matching algorithm
│   │   ├── types.ts              # TypeScript interfaces
│   │   └── index.ts              # Express server entry point
│   ├── data/                     # SQLite database files (auto-created)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts         # API client functions
│   │   ├── components/
│   │   │   ├── modal/            # Reusable modal components
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── SortableTable.tsx
│   │   │   ├── order/            # Order management components
│   │   │   │   ├── OrderManager.tsx
│   │   │   │   ├── OrderDetailView.tsx
│   │   │   │   ├── OrderMatcher.tsx
│   │   │   │   └── PendingOrderCard.tsx
│   │   │   ├── transaction/      # Transaction components
│   │   │   │   ├── TransactionManager.tsx
│   │   │   │   ├── TransactionViewer.tsx
│   │   │   │   ├── TransactionDetailView.tsx
│   │   │   │   ├── TransactionForm.tsx
│   │   │   │   └── TransactionList.tsx
│   │   │   └── pendingTransaction/  # Pending review components
│   │   │       ├── PendingTransactionsManager.tsx
│   │   │       └── PendingTransactionEditModal.tsx
│   │   ├── App.tsx               # Main application component
│   │   ├── App.css               # Styling
│   │   └── types.ts              # TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
├── .gitignore                    # Git ignore rules
├── README.md
└── QUICKSTART.md                 # Quick start guide
```

## Setup and Installation

### Prerequisites
- Node.js (v20.19+ or v22.12+)
- npm (v10+)

### Quick Start

See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions.

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Run the backend server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production build
npm run build
npm start
```

The backend server will run on `http://localhost:8080`.

### Frontend Setup

1. Navigate to the frontend directory (in a new terminal):
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy).

## Usage

### 1. Manage Orders

- Navigate to the "Manage Orders" tab
- **Import from File**: Click "Import from File" and select a JSON file
- **Paste JSON**: Click "Paste JSON" and paste a JSON array of orders
- **Add Manually**: Click "Add Manually" to create orders one by one
  - Fill in customer name, order ID, date, item, and price
  - Click "Add to List" to queue the order
  - Click "Submit All" when ready
- View all orders in the sortable table
- Click "View" to see order details in a modal
- Delete orders using the × button

### 2. Import & Match Transactions

- Navigate to the "Import & Match Transactions" tab
- **Import from File**, **Paste JSON**, or **Add Manually** (same as orders)
- Transactions require additional fields:
  - Transaction type (e.g., "payment", "refund")
  - Transaction amount
- On import, transactions are automatically matched against orders
- Matched transactions → sent to pending review (status: pending)
- Unmatched transactions → auto-rejected and saved for audit (status: rejected)
- You'll see a success message showing the count

### 3. Review Pending Transactions

- Navigate to the "Review Pending" tab
- Filter by status: **Pending**, **Approved**, **Rejected**, or **All**
- View matched transactions with:
  - Match score (0-100)
  - Matched order details (clickable)
  - Transaction details
  - Status badge (color-coded)
- **For pending transactions**:
  - **Edit (✏️)**: Modify transaction details
    - Auto-fix button appears if fields don't match the matched order
    - Click "🔧 Auto-fix to match order" to align customer, orderId, and item
    - Review and click "Save Changes"
  - **Approve (✓)**: Saves to transactions table (only if fields match)
  - **Reject (✗)**: Marks as rejected
  - **Delete (🗑)**: Permanently removes
- Click Order IDs or Matched Order IDs to view order details in a modal
- Sort by any column by clicking the header

### 4. Manage Transactions

- Navigate to the "Manage Transactions" tab
- View all approved transactions
- Click Order IDs to see the linked order details
- Click "View" for detailed transaction information
- Sort and manage your transaction records

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all approved transactions
- `POST /api/transactions` - Create transactions (array) - auto-matched against orders
- `DELETE /api/transactions/:id` - Delete a specific transaction

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create orders (array)
- `DELETE /api/orders/:id` - Delete a specific order

### Matching
- `POST /api/match` - Match orders with transactions
  - Saves matched transactions as 'pending' status
  - Saves unmatched transactions as 'rejected' status

### Pending Transactions
- `GET /api/pending-transactions?status=pending|approved|rejected` - Get pending transactions (with matched order info)
- `PUT /api/pending-transactions/:id` - Update pending transaction details
- `PUT /api/pending-transactions/:id/approve` - Approve a pending transaction (validates match first)
- `PUT /api/pending-transactions/:id/reject` - Reject a pending transaction
- `DELETE /api/pending-transactions/:id` - Delete a pending transaction

## Database Schema

### orders
- `id` - Auto-increment primary key
- `customer` - Customer name
- `orderId` - Order identifier
- `date` - Order date
- `item` - Item name
- `price` - Order price
- `created_at` - Timestamp

### transactions
- `id` - Auto-increment primary key
- `customer` - Customer name
- `orderId` - Order identifier
- `date` - Transaction date
- `item` - Item name
- `price` - Item price
- `txnType` - Transaction type
- `txnAmount` - Transaction amount
- `created_at` - Timestamp

### pending_transactions
- `id` - Auto-increment primary key
- `customer` - Customer name
- `orderId` - Order identifier
- `date` - Transaction date
- `item` - Item name
- `price` - Item price
- `txnType` - Transaction type
- `txnAmount` - Transaction amount
- `matched_order_id` - Foreign key to orders table (nullable)
- `matchScore` - Match confidence score (0-100)
- `status` - pending | approved | rejected
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Matching Algorithm Explanation

The fuzzy matching algorithm uses multiple signals to find the best match:

1. **Customer Name** (30%): Uses `token_sort_ratio` to handle word order variations
2. **Order ID** (35%): Uses `ratio` for character-level matching (handles OCR errors)
3. **Item Name** (20%): Uses `token_sort_ratio` for flexible item matching
4. **Price** (10%): Exact match or within 10% tolerance
5. **Date** (5%): Transaction must be on or after order date, within 90 days

**Threshold**: Matches with scores ≥ 60% are considered valid.

### Approval Validation

Before a transaction can be approved, the system validates that:
- `customer` matches the matched order's customer
- `orderId` matches the matched order's orderId
- `item` matches the matched order's item

If any field doesn't match, use the Auto-Fix feature or edit manually before approving.

## Sample Data

### Sample Orders:
```json
[
  {"customer": "Alex Abel", "orderId": "18G", "date": "2023-07-11", "item": "Tool A", "price": 1.23},
  {"customer": "Brian Bell", "orderId": "20S", "date": "2023-08-08", "item": "Toy B", "price": 3.21}
]
```

### Sample Transactions (with intentional errors):
```json
[
  {"customer": "Alexis Abe", "orderId": "1B6", "date": "2023-07-12", "item": "Tool A", "price": 1.23, "txnType": "payment", "txnAmount": 1.23},
  {"customer": "Alex Able", "orderId": "I8G", "date": "2023-07-13", "item": "Tool A", "price": 1.23, "txnType": "refund", "txnAmount": -1.23},
  {"customer": "Brian Ball", "orderId": "ZOS", "date": "2023-08-11", "item": "Toy B", "price": 3.21, "txnType": "payment-1", "txnAmount": 1.21},
  {"customer": "Bryan", "orderId": "705", "date": "2023-08-13", "item": "Toy B", "price": 3.21, "txnType": "payment-2", "txnAmount": 2.00}
]
```

The algorithm successfully matches these despite the errors!

## Development

### Backend Development
```bash
cd backend
npm run dev  # Runs with tsx watch for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Runs Vite dev server with HMR
```

### Building for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Key Features & Improvements

- ✅ **MVC Architecture**: Clean separation of concerns with controllers and models
- ✅ **Pending Transactions**: Complete review workflow for matched transactions
- ✅ **Auto-Fix**: One-click field alignment with matched orders
- ✅ **Approval Validation**: Ensures data integrity before approval
- ✅ **Auto-Rejection**: Unmatched transactions saved with 'rejected' status
- ✅ **Complete Audit Trail**: All transactions persisted in database
- ✅ **Sortable Tables**: Click-to-sort on all columns
- ✅ **Modal Views**: Clean detail and edit modals
- ✅ **Organized Components**: Domain-based component structure
- ✅ **Manual Entry**: Add orders/transactions without JSON
- ✅ **Clickable References**: Order IDs link to detail views
- ✅ **Status Badges**: Visual indication of transaction status

## Future Enhancements

- Bulk import/export (CSV support)
- Advanced filtering and search
- Analytics dashboard
- Email notifications for pending approvals
- Multi-user support with authentication
- Customizable matching weights
- Machine learning to improve matching over time
- Batch approve/reject operations
- Export audit reports

## License

ISC

## Author

Built with TypeScript, React, Node.js, and SQLite
