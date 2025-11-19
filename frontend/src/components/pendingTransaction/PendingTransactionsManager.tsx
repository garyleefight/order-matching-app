import { useState, useEffect } from 'react';
import type { PendingTransaction, Order } from '../../types';
import { api } from '../../api/client';
import SortableTable, { type Column } from '../modal/SortableTable';
import PendingTransactionEditModal from './PendingTransactionEditModal';
import Modal from '../modal/Modal';
import OrderDetailView from '../order/OrderDetailView';

export default function PendingTransactionsManager() {
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<PendingTransaction | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [txnData, orderData] = await Promise.all([
        api.getPendingTransactions(filter === 'all' ? undefined : filter),
        api.getOrders()
      ]);
      setPendingTransactions(txnData);
      setOrders(orderData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const checkTransactionMatchesOrder = (txn: PendingTransaction): boolean => {
    if (!txn.matchedOrder) return false;

    return (
      txn.customer === txn.matchedOrder.customer &&
      txn.orderId === txn.matchedOrder.orderId &&
      txn.item === txn.matchedOrder.item
    );
  };

  const handleApprove = async (id: number) => {
    const txn = pendingTransactions.find(t => t.id === id);
    if (!txn) return;

    if (!checkTransactionMatchesOrder(txn)) {
      setError('Cannot approve: Transaction details (customer, orderId, item) do not match the matched order. Please use Auto-Fix or edit the transaction first.');
      return;
    }

    try {
      await api.approvePendingTransaction(id);
      await loadData();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve transaction');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.rejectPendingTransaction(id);
      await loadData();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject transaction');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this pending transaction?')) return;

    try {
      await api.deletePendingTransaction(id);
      await loadData();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
    }
  };

  const handleSaveEdit = async (id: number, updates: Partial<PendingTransaction>) => {
    await api.updatePendingTransaction(id, updates);
    await loadData();
    setError(null);
  };

  const handleOrderIdClick = (orderId: string) => {
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
      setSelectedOrder(order);
    }
  };

  const pendingColumns: Column<PendingTransaction>[] = [
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
      render: (txn) => new Date(txn.date).toLocaleDateString(),
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
    },
    {
      key: 'matchedOrder',
      header: 'Matched Order',
      render: (txn) => txn.matchedOrder ? (
        <span
          className="clickable-order-id"
          onClick={() => txn.matchedOrder && setSelectedOrder(txn.matchedOrder)}
        >
          {txn.matchedOrder.orderId}
        </span>
      ) : 'N/A',
      sortFn: (a, b) => {
        const orderA = a.matchedOrder?.orderId || '';
        const orderB = b.matchedOrder?.orderId || '';
        return orderA.localeCompare(orderB);
      }
    },
    {
      key: 'matchScore',
      header: 'Score',
      render: (txn) => txn.matchScore !== undefined ? txn.matchScore : 'N/A',
      sortFn: (a, b) => (b.matchScore || 0) - (a.matchScore || 0)
    },
    {
      key: 'status',
      header: 'Status',
      render: (txn) => (
        <span className={`status-badge status-${txn.status}`}>
          {txn.status}
        </span>
      ),
      sortFn: (a, b) => a.status.localeCompare(b.status)
    },
    {
      key: 'submitted_at',
      header: 'Submitted',
      render: (txn) => txn.submitted_at
        ? new Date(txn.submitted_at).toLocaleString()
        : 'N/A',
      sortFn: (a, b) => {
        const dateA = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
        const dateB = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
        return dateB - dateA; // Most recent first
      }
    }
  ];

  return (
    <div className="pending-transactions-manager">
      <div className="header">
        <h2>Review Pending Transactions</h2>
        <div className="controls">
          <div className="filter-buttons">
            <button
              onClick={() => setFilter('pending')}
              className={filter === 'pending' ? 'active' : ''}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={filter === 'approved' ? 'active' : ''}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={filter === 'rejected' ? 'active' : ''}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'active' : ''}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error">
          {error}
          <button onClick={() => setError(null)} className="btn-close">×</button>
        </div>
      )}

      {loading ? (
        <p className="loading">Loading pending transactions...</p>
      ) : (
        <SortableTable
          data={pendingTransactions}
          columns={pendingColumns}
          actions={(txn) => (
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {txn.status === 'pending' && (
                <>
                  <button
                    onClick={() => setEditingTransaction(txn)}
                    className="btn-edit"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleApprove(txn.id!)}
                    className="btn-approve"
                    title="Approve"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => handleReject(txn.id!)}
                    className="btn-reject"
                    title="Reject"
                  >
                    ✗
                  </button>
                </>
              )}
              <button
                onClick={() => handleDelete(txn.id!)}
                className="btn-delete"
                title="Delete"
              >
                🗑
              </button>
            </div>
          )}
          emptyMessage={`No ${filter === 'all' ? '' : filter} transactions found`}
          defaultSortKey="matchScore"
        />
      )}

      {/* Edit Transaction Modal */}
      <PendingTransactionEditModal
        transaction={editingTransaction}
        onSave={handleSaveEdit}
        onClose={() => setEditingTransaction(null)}
      />

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
