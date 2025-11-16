import { useState, useEffect } from 'react';
import type { Transaction, Order } from '../../types';
import { api } from '../../api/client';
import SortableTable, { type Column } from '../modal/SortableTable';
import Modal from '../modal/Modal';
import TransactionDetailView from './TransactionDetailView';
import OrderDetailView from '../order/OrderDetailView';

export default function TransactionViewer() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [txnData, orderData] = await Promise.all([
        api.getTransactions(),
        api.getOrders()
      ]);
      setTransactions(txnData);
      setOrders(orderData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await api.deleteTransaction(id);
      await loadData();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
    }
  };

  const handleOrderIdClick = (orderId: string) => {
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
      setSelectedOrder(order);
    }
  };

  const transactionColumns: Column<Transaction>[] = [
    {
      key: 'customer',
      header: 'Customer',
      render: (txn) => <strong>{txn.customer}</strong>,
      sortFn: (a, b) => a.customer.localeCompare(b.customer)
    },
    {
      key: 'orderId',
      header: 'Order ID',
      render: (txn) => (
        <span
          className="clickable-order-id"
          onClick={() => handleOrderIdClick(txn.orderId)}
        >
          {txn.orderId}
        </span>
      ),
      sortFn: (a, b) => a.orderId.localeCompare(b.orderId)
    },
    {
      key: 'date',
      header: 'Date',
      render: (txn) => txn.date,
      sortFn: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    },
    {
      key: 'item',
      header: 'Item',
      render: (txn) => txn.item,
      sortFn: (a, b) => a.item.localeCompare(b.item)
    },
    {
      key: 'price',
      header: 'Price',
      render: (txn) => `$${txn.price.toFixed(2)}`,
      sortFn: (a, b) => a.price - b.price
    },
    {
      key: 'txnType',
      header: 'Type',
      render: (txn) => txn.txnType,
      sortFn: (a, b) => a.txnType.localeCompare(b.txnType)
    },
    {
      key: 'txnAmount',
      header: 'Amount',
      render: (txn) => `$${txn.txnAmount.toFixed(2)}`,
      sortFn: (a, b) => a.txnAmount - b.txnAmount
    }
  ];

  if (loading) {
    return (
      <div className="transaction-manager">
        <h2>Manage Transactions</h2>
        <p className="loading">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="transaction-manager">
      <h2>Manage Transactions</h2>
      <p className="description">
        View and manage all transactions in the system. Click on an Order ID to view order details.
      </p>

      {error && (
        <div className="error">
          {error}
          <button onClick={() => setError(null)} className="btn-close">×</button>
        </div>
      )}

      <div className="transaction-list">
        <h3>All Transactions ({transactions.length})</h3>
        <SortableTable
          data={transactions}
          columns={transactionColumns}
          actions={(txn) => (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setSelectedTransaction(txn)}
                className="btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                title="View details"
              >
                View
              </button>
              <button
                onClick={() => txn.id && handleDelete(txn.id)}
                className="btn-delete"
                title="Delete transaction"
              >
                ×
              </button>
            </div>
          )}
          emptyMessage="No transactions yet. Import and approve transactions from the pending review."
          defaultSortKey="customer"
        />
      </div>

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={selectedTransaction !== null}
        onClose={() => setSelectedTransaction(null)}
        title="Transaction Details"
        size="medium"
      >
        {selectedTransaction && <TransactionDetailView transaction={selectedTransaction} />}
      </Modal>

      {/* Order Detail Modal */}
      <Modal
        isOpen={selectedOrder !== null}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
        size="medium"
      >
        {selectedOrder && <OrderDetailView order={selectedOrder} />}
      </Modal>
    </div>
  );
}
