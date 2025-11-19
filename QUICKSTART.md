# Quick Start Guide

Get the Order-Transaction Matching Application up and running in 5 minutes!

## Prerequisites

Make sure you have installed:
- **Node.js** v22.12+ ([Download here](https://nodejs.org/))
- **npm** v10+ (comes with Node.js)

Verify your installation:
```bash
node --version  # Should show v22.12+
npm --version   # Should show v10+
```

## Step 1: Clone or Download the Project

```bash
cd /path/to/your/projects
# If you have the project locally, navigate to it
cd order-matching-app
```

## Step 2: Install Backend Dependencies

Open a terminal and run:

```bash
cd backend
npm install
```

This will install all required backend packages including:
- Express.js (web framework)
- better-sqlite3 (database)
- fuzzball (fuzzy matching)
- TypeScript and development tools

## Step 3: Install Frontend Dependencies

Open a **new terminal** (keep the first one open) and run:

```bash
cd frontend
npm install
```

This will install all required frontend packages including:
- React 19
- Vite (build tool)
- TypeScript

## Step 4: Start the Backend Server

In the **first terminal** (in the `backend` directory):

```bash
npm run dev
```

You should see:
```
Server running on http://localhost:8080
Database initialized successfully
```

The backend will:
- Create a SQLite database at `backend/data/orders.db`
- Initialize three tables: `orders`, `transactions`, and `pending_transactions`
- Start the API server on port 8080

## Step 5: Start the Frontend Development Server

In the **second terminal** (in the `frontend` directory):

```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Step 6: Open the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the Order-Transaction Matching Application with four tabs:
1. **Manage Orders**
2. **Import & Match Transactions**
3. **Manage Transactions**
4. **Review Pending**

## Step 7: Try It Out!

### Import Sample Orders

1. Click the **"Manage Orders"** tab
2. Click **"Paste JSON"**
3. Paste this sample data:

```json
[
  {"customer": "Alex Abel", "orderId": "18G", "date": "2023-07-11", "item": "Tool A", "price": 1.23},
  {"customer": "Brian Bell", "orderId": "20S", "date": "2023-08-08", "item": "Toy B", "price": 3.21}
]
```

4. Click **"Import JSON"**
5. You should see: "Successfully imported 2 order(s)"

### Import and Match Transactions

1. Click the **"Import & Match Transactions"** tab
2. Click **"Paste JSON"**
3. Paste this sample data (with intentional errors):

```json
[
  {"customer": "Alexis Abe", "orderId": "1B6", "date": "2023-07-12", "item": "Tool A", "price": 1.23, "txnType": "payment", "txnAmount": 1.23},
  {"customer": "Alex Able", "orderId": "I8G", "date": "2023-07-13", "item": "Tool A", "price": 1.23, "txnType": "refund", "txnAmount": -1.23},
  {"customer": "Brian Ball", "orderId": "ZOS", "date": "2023-08-11", "item": "Toy B", "price": 3.21, "txnType": "payment-1", "txnAmount": 1.21},
  {"customer": "Bryan", "orderId": "705", "date": "2023-08-13", "item": "Toy B", "price": 3.21, "txnType": "payment-2", "txnAmount": 2.00}
]
```

4. Click **"Import JSON"**
5. Watch the magic happen! The fuzzy matching algorithm will match transactions to orders despite the errors
6. You'll see: "Import complete! 4 transaction(s) sent to pending review, 0 auto-rejected"

### Review and Approve Transactions

1. Click the **"Review Pending"** tab
2. You'll see 4 pending transactions with match scores (85-95%)
3. Notice the matched transactions have errors but were still matched:
   - "Alexis Abe" matched to "Alex Abel"
   - "1B6" matched to "18G"
   - "Bryan" matched to "Brian Bell"
4. For each transaction:
   - Click **"View"** to see details
   - Click **"✏️ Edit"** to modify if needed
   - If fields don't match, use **"🔧 Auto-fix"** to align with the order
   - Click **"✓ Approve"** to save to the transactions table
   - Or click **"✗ Reject"** to mark as rejected

### View Approved Transactions

1. Click the **"Manage Transactions"** tab
2. View all approved transactions
3. Click on Order IDs to see linked order details
4. Sort by any column by clicking the header

## Common Commands

### Backend
```bash
cd backend

npm run dev      # Start development server with auto-reload
npm run build    # Build for production
npm start        # Run production build
```

### Frontend
```bash
cd frontend

npm run dev      # Start development server with HMR
npm run build    # Build for production
npm run preview  # Preview production build
```

## Troubleshooting

### Port Already in Use

If port 8080 or 5173 is already in use:

**Backend (port 8080):**
- Find and kill the process using port 8080
- Or modify `backend/src/index.ts` to use a different port

**Frontend (port 5173):**
- Vite will automatically suggest the next available port
- Or press `q` to quit and manually specify a port with `npm run dev -- --port 3000`

### Cannot Connect to Backend

Make sure:
1. Backend server is running (`npm run dev` in the `backend` directory)
2. You see "Server running on http://localhost:8080"
3. Frontend API URL is correct (`frontend/src/api/client.ts` should point to `http://localhost:8080`)

### Database Issues

If you encounter database errors:
1. Stop the backend server
2. Delete `backend/data/orders.db`
3. Restart the backend server (database will be recreated automatically)

### Import/Module Errors

If you see module not found errors:
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the matching algorithm in `backend/src/matcher.ts`
- Try the manual entry feature (click "Add Manually" buttons)
- Experiment with different match scenarios
- Check out the sortable tables (click column headers)
- Use the auto-fix feature in the edit modal
- View order details by clicking Order IDs

## Getting Help

If you run into issues:
1. Check the browser console for frontend errors (F12)
2. Check the terminal for backend errors
3. Verify both servers are running
4. Make sure you're using Node.js v22.12+
5. Try deleting `node_modules` and running `npm install` again

## Architecture Overview

```
Frontend (React + Vite)          Backend (Express + TypeScript)
Port: 5173                       Port: 8080
        │                                │
        ├─ Manage Orders ───────────────>├─ POST /api/orders
        ├─ Import Transactions ─────────>├─ POST /api/match
        ├─ Review Pending ──────────────>├─ GET /api/pending-transactions
        │  │                             │  PUT /api/pending-transactions/:id/approve
        │  └─ Auto-fix ─────────────────>│  PUT /api/pending-transactions/:id
        └─ Manage Transactions ─────────>└─ GET /api/transactions
                                                  │
                                                  v
                                          SQLite Database
                                          (backend/data/orders.db)
                                          ├─ orders
                                          ├─ transactions
                                          └─ pending_transactions
```

## Key Features to Try

- ✅ **Fuzzy Matching**: Import transactions with typos and watch them match
- ✅ **Auto-Fix**: Edit a transaction and use the auto-fix button
- ✅ **Manual Entry**: Add orders/transactions one by one
- ✅ **Sortable Tables**: Click any column header to sort
- ✅ **Modal Views**: Click "View" or Order IDs for details
- ✅ **Status Filters**: Filter pending transactions by status
- ✅ **Approval Validation**: Try to approve a mismatched transaction
- ✅ **Audit Trail**: Check the "Rejected" filter to see auto-rejected transactions

Enjoy using the Order-Transaction Matching Application! 🎉
