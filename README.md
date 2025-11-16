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
1. **Manage Transactions**: Add, view, and delete transactions in the database
2. **Match Orders**: Upload orders as JSON array to match against existing transactions
3. **Review Pending Orders**: Approve or reject matched orders with confidence scores
4. **Persistent Storage**: Approved orders saved to SQLite database with full audit trail

### Technical Highlights
- **Pending Orders System**: Matched orders saved to `pending_orders` table for review
- **Status Tracking**: pending → approved/rejected with timestamps
- **Modular Component Architecture**: Easy to extend and maintain
- **Proper Error Handling**: 4xx for client errors, 5xx for server errors

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite with better-sqlite3
- **Fuzzy Matching**: fuzzball

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Custom CSS

## Project Structure

```
order-matching-app/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── database.ts          # Database initialization and schema
│   │   ├── index.ts                 # Express server and API routes
│   │   ├── matcher.ts               # Fuzzy matching algorithm
│   │   └── types.ts                 # TypeScript interfaces
│   ├── data/                        # SQLite database files (auto-created)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts            # API client functions
│   │   ├── components/
│   │   │   ├── TransactionManager.tsx
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── TransactionList.tsx
│   │   │   ├── OrderMatcher.tsx
│   │   │   ├── PendingOrdersManager.tsx
│   │   │   └── PendingOrderCard.tsx
│   │   ├── App.tsx                  # Main application component
│   │   ├── App.css                  # Styling
│   │   └── types.ts                 # TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Setup and Installation

### Prerequisites
- Node.js (v20.19+ or v22.12+)
- npm (v10+)

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

### 1. Manage Transactions

- Navigate to the "Manage Transactions" tab
- Fill in the transaction form:
  - Customer name
  - Order ID
  - Date
  - Item name
  - Price
  - Transaction type (e.g., "payment", "refund", "payment-1")
  - Transaction amount
- Click "Add Transaction" to save
- View all transactions in the list below
- Delete transactions using the × button

### 2. Match Orders

- Navigate to the "Match Orders" tab
- Paste a JSON array of orders in the textarea:

```json
[
  {
    "customer": "Alex Abel",
    "orderId": "18G",
    "date": "2023-07-11",
    "item": "Tool A",
    "price": 1.23
  },
  {
    "customer": "Brian Bell",
    "orderId": "20S",
    "date": "2023-08-08",
    "item": "Toy B",
    "price": 3.21
  }
]
```

- Click "Match Orders with Transactions"
- Matched orders are automatically saved to the pending_orders table
- You'll be redirected to the "Review Pending Orders" tab

### 3. Review Pending Orders

- View all pending orders with their match scores
- See matched transactions for each order
- Filter by status: Pending, Approved, Rejected, or All
- For each pending order:
  - **Approve**: Saves to the orders table and marks as approved
  - **Reject**: Marks as rejected (stays in pending_orders)
  - **Delete**: Permanently removes from pending_orders
- Timestamps show when orders were created and last updated

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transactions (array)
- `DELETE /api/transactions/:id` - Delete a specific transaction
- `DELETE /api/transactions` - Delete all transactions

### Orders
- `GET /api/orders` - Get all approved orders
- `DELETE /api/orders/:id` - Delete a specific order
- `DELETE /api/orders` - Delete all orders

### Matching
- `POST /api/match` - Match orders with transactions and save to pending

### Pending Orders
- `GET /api/pending-orders?status=pending|approved|rejected` - Get pending orders
- `PUT /api/pending-orders/:id/approve` - Approve a pending order
- `PUT /api/pending-orders/:id/reject` - Reject a pending order
- `DELETE /api/pending-orders/:id` - Delete a pending order

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

### pending_orders
- `id` - Auto-increment primary key
- `customer` - Customer name
- `orderId` - Order identifier
- `date` - Order date
- `item` - Item name
- `price` - Order price
- `matchScore` - Match confidence score (0-100)
- `matchedTransactions` - JSON array of matched transactions
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

## Future Enhancements

- Bulk import/export (CSV support)
- Advanced filtering and search
- Analytics dashboard
- Email notifications for pending approvals
- Multi-user support with authentication
- Customizable matching weights
- Machine learning to improve matching over time

## License

ISC

## Author

Built with TypeScript, React, Node.js, and SQLite
