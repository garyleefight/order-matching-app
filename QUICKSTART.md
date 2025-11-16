# Quick Start Guide

## Prerequisites
- Node.js (v20.19+ or v22.12+ recommended, v21.7.1 will work with warnings)
- npm (v10+)

## Installation (One-Time Setup)

```bash
# Install all dependencies
npm run install:all
```

Or manually:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Running the Application

### Option 1: Run Both Servers (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:8080

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:5173

### Option 2: From Root Directory

**Terminal 1:**
```bash
npm run dev:backend
```

**Terminal 2:**
```bash
npm run dev:frontend
```

## Testing the Application

1. **Open Browser**: Navigate to http://localhost:5173

2. **Add Transactions**:
   - Go to "Manage Transactions" tab
   - Add sample transactions:
     ```
     Customer: Alexis Abe
     Order ID: 1B6
     Date: 2023-07-12
     Item: Tool A
     Price: 1.23
     Type: payment
     Amount: 1.23
     ```
   - Click "Add Transaction"
   - Repeat for more transactions (see sample-data.json)

3. **Match Orders**:
   - Go to "Match Orders" tab
   - Paste this JSON:
     ```json
     [
       {
         "customer": "Alex Abel",
         "orderId": "18G",
         "date": "2023-07-11",
         "item": "Tool A",
         "price": 1.23
       }
     ]
     ```
   - Click "Match Orders with Transactions"

4. **Review Pending Orders**:
   - You'll be automatically redirected to "Review Pending Orders"
   - See the match score (should be ~72% for the sample data)
   - Click "Approve" to save to the orders database
   - Or click "Reject" to mark as rejected

## Sample Data

See `sample-data.json` for complete sample orders and transactions with intentional errors that demonstrate the fuzzy matching capabilities.

## Testing via API (cURL)

```bash
# Add a transaction
curl -X POST http://localhost:8080/api/transactions \
  -H "Content-Type: application/json" \
  -d '[{"customer":"Alexis Abe","orderId":"1B6","date":"2023-07-12","item":"Tool A","price":1.23,"txnType":"payment","txnAmount":1.23}]'

# Match orders
curl -X POST http://localhost:8080/api/match \
  -H "Content-Type: application/json" \
  -d '{"orders":[{"customer":"Alex Abel","orderId":"18G","date":"2023-07-11","item":"Tool A","price":1.23}],"transactions":[{"customer":"Alexis Abe","orderId":"1B6","date":"2023-07-12","item":"Tool A","price":1.23,"txnType":"payment","txnAmount":1.23}]}'

# Get pending orders
curl http://localhost:8080/api/pending-orders

# Approve a pending order
curl -X PUT http://localhost:8080/api/pending-orders/1/approve

# Get approved orders
curl http://localhost:8080/api/orders
```

## Database Location

The SQLite database is automatically created at:
```
backend/data/orders.db
```

## Troubleshooting

### Port Already in Use
If port 8080 (backend) or 5173 (frontend) is already in use:
- Backend: Change `PORT` in `backend/src/index.ts`
- Frontend: Vite will automatically use the next available port

### CORS Errors
Make sure the backend is running on port 8080, or update `API_URL` in `frontend/src/api/client.ts`

### Module Not Found
Run `npm install` in both backend and frontend directories

### Node Version Warnings
The app works with Node v21.7.1 but you may see engine warnings. These are non-critical.

## Next Steps

1. Try the sample data with intentional errors to see fuzzy matching in action
2. Experiment with different match thresholds in `backend/src/matcher.ts`
3. Add more transactions and test the approval workflow
4. Check the database to see the pending orders with different statuses

## Features to Explore

- ✅ Fuzzy matching handles typos ("Alex Abel" vs "Alexis Abe")
- ✅ OCR error handling ("18G" vs "I8G" vs "1B6")
- ✅ Match scoring (0-100%)
- ✅ Pending approval workflow
- ✅ Status filtering (pending/approved/rejected)
- ✅ Timestamps for audit trail

Happy matching! 🎯
