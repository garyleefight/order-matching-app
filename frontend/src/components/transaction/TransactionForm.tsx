import { useState } from 'react';
import type { Transaction } from '../../types';

interface Props {
  onSubmit: (transaction: Transaction) => Promise<void>;
}

export default function TransactionForm({ onSubmit }: Props) {
  const [form, setForm] = useState({
    customer: '',
    orderId: '',
    date: '',
    item: '',
    price: '',
    txnType: '',
    txnAmount: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit({
        customer: form.customer,
        orderId: form.orderId,
        date: form.date,
        item: form.item,
        price: parseFloat(form.price),
        txnType: form.txnType,
        txnAmount: parseFloat(form.txnAmount)
      });

      // Reset form on success
      setForm({
        customer: '',
        orderId: '',
        date: '',
        item: '',
        price: '',
        txnType: '',
        txnAmount: ''
      });
    } catch {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <input
        type="text"
        placeholder="Customer"
        value={form.customer}
        onChange={(e) => setForm({ ...form, customer: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Order ID"
        value={form.orderId}
        onChange={(e) => setForm({ ...form, orderId: e.target.value })}
        required
      />
      <input
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Item"
        value={form.item}
        onChange={(e) => setForm({ ...form, item: e.target.value })}
        required
      />
      <input
        type="number"
        step="0.01"
        placeholder="Price"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Type (e.g., payment, refund)"
        value={form.txnType}
        onChange={(e) => setForm({ ...form, txnType: e.target.value })}
        required
      />
      <input
        type="number"
        step="0.01"
        placeholder="Amount"
        value={form.txnAmount}
        onChange={(e) => setForm({ ...form, txnAmount: e.target.value })}
        required
      />
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? 'Adding...' : 'Add Transaction'}
      </button>
    </form>
  );
}
