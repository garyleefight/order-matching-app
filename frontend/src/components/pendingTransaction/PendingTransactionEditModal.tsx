import { useState, useEffect } from 'react';
import type { PendingTransaction } from '../../types';
import Modal from '../modal/Modal';

interface PendingTransactionEditModalProps {
  transaction: PendingTransaction | null;
  onSave: (id: number, updates: Partial<PendingTransaction>) => Promise<void>;
  onClose: () => void;
}

export default function PendingTransactionEditModal({ transaction, onSave, onClose }: PendingTransactionEditModalProps) {
  const [editForm, setEditForm] = useState<Partial<PendingTransaction>>({});
  const [saving, setSaving] = useState(false);

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction) {
      setEditForm({
        customer: transaction.customer,
        orderId: transaction.orderId,
        date: transaction.date,
        item: transaction.item,
        price: transaction.price,
        txnType: transaction.txnType,
        txnAmount: transaction.txnAmount,
      });
    }
  }, [transaction]);

  const handleAutoFix = () => {
    if (!transaction?.matchedOrder) return;

    setEditForm({
      ...editForm,
      customer: transaction.matchedOrder.customer,
      orderId: transaction.matchedOrder.orderId,
      item: transaction.matchedOrder.item
    });
  };

  const canAutoFix = transaction?.matchedOrder && (
    transaction.customer !== transaction.matchedOrder.customer ||
    transaction.orderId !== transaction.matchedOrder.orderId ||
    transaction.item !== transaction.matchedOrder.item
  );

  const handleSave = async () => {
    if (!transaction?.id) return;
    setSaving(true);
    try {
      await onSave(transaction.id, editForm);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={transaction !== null}
      onClose={onClose}
      title="Edit Transaction"
      size="medium"
      footer={
        <>
          <button
            onClick={onClose}
            className="btn-delete"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      }
    >
      {transaction && (
        <>
          {canAutoFix && (
            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fef3c7', borderRadius: '6px', border: '1px solid #f59e0b' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500', color: '#92400e' }}>
                Transaction details don't match the matched order
              </p>
              <button
                onClick={handleAutoFix}
                className="btn-auto-fix"
                style={{ padding: '0.5rem 1rem' }}
              >
                🔧 Auto-fix to match order
              </button>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Customer Name</label>
              <input
                type="text"
                value={editForm.customer ?? transaction.customer}
                onChange={(e) => setEditForm({ ...editForm, customer: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
            </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Order ID</label>
            <input
              type="text"
              value={editForm.orderId ?? transaction.orderId}
              onChange={(e) => setEditForm({ ...editForm, orderId: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Date</label>
            <input
              type="date"
              value={editForm.date ?? transaction.date}
              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Item</label>
            <input
              type="text"
              value={editForm.item ?? transaction.item}
              onChange={(e) => setEditForm({ ...editForm, item: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price</label>
            <input
              type="number"
              step="0.01"
              value={editForm.price ?? transaction.price}
              onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Transaction Type</label>
            <input
              type="text"
              value={editForm.txnType ?? transaction.txnType}
              onChange={(e) => setEditForm({ ...editForm, txnType: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Transaction Amount</label>
            <input
              type="number"
              step="0.01"
              value={editForm.txnAmount ?? transaction.txnAmount}
              onChange={(e) => setEditForm({ ...editForm, txnAmount: parseFloat(e.target.value) })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>
        </div>
        </>
      )}
    </Modal>
  );
}
