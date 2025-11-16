import { useState } from 'react';
import './App.css';
import OrderManager from './components/order/OrderManager';
import TransactionManager from './components/transaction/TransactionManager';
import TransactionViewer from './components/transaction/TransactionViewer';
import PendingTransactionsManager from './components/pendingTransaction/PendingTransactionsManager';

function App() {
  const [activeTab, setActiveTab] = useState<'orders' | 'transactions' | 'manage-transactions' | 'pending'>('orders');
  const [pendingKey, setPendingKey] = useState(0);

  const refreshPending = () => {
    setPendingKey((prev: number) => prev + 1);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Order-Transaction Matching System</h1>
        <p>Fuzzy matching for orders with data entry errors</p>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          Manage Orders
        </button>
        <button
          className={activeTab === 'transactions' ? 'active' : ''}
          onClick={() => setActiveTab('transactions')}
        >
          Import & Match Transactions
        </button>
        <button
          className={activeTab === 'manage-transactions' ? 'active' : ''}
          onClick={() => setActiveTab('manage-transactions')}
        >
          Manage Transactions
        </button>
        <button
          className={activeTab === 'pending' ? 'active' : ''}
          onClick={() => setActiveTab('pending')}
        >
          Review Pending
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'orders' && <OrderManager />}

        {activeTab === 'transactions' && <TransactionManager />}

        {activeTab === 'manage-transactions' && <TransactionViewer />}

        {activeTab === 'pending' && (
          <PendingTransactionsManager key={pendingKey} />
        )}
      </main>

      <footer className="app-footer">
        <p>Built with React + TypeScript + Node.js + SQLite</p>
      </footer>
    </div>
  );
}

export default App;
