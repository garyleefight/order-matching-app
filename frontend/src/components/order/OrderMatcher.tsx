import { useState } from 'react';
import type { Order, Transaction } from '../../types';
import { api } from '../../api/client';

interface Props {
  transactions: Transaction[];
  onMatchComplete: () => void;
}

export default function OrderMatcher({ transactions, onMatchComplete }: Props) {
  const [ordersJSON, setOrdersJSON] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleMatch = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const orders: Order[] = JSON.parse(ordersJSON);
      const result = await api.matchOrders(orders, transactions);
      setSuccess(result.message || `${result.matched.length} orders matched and saved to pending`);
      setOrdersJSON('');
      onMatchComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to match orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-matcher">
      <h2>Match Orders</h2>
      <p className="description">
        Upload orders as JSON array to match with existing transactions.
        Matched orders will be saved as pending for your review.
      </p>

      {error && (
        <div className="error">
          {error}
          <button onClick={() => setError(null)} className="btn-close">×</button>
        </div>
      )}

      {success && (
        <div className="success">
          {success}
          <button onClick={() => setSuccess(null)} className="btn-close">×</button>
        </div>
      )}

      <textarea
        value={ordersJSON}
        onChange={(e) => setOrdersJSON(e.target.value)}
        placeholder='[{"customer": "Alex Abel", "orderId": "18G", "date": "2023-07-11", "item": "Tool A", "price": 1.23}]'
        rows={10}
        className="json-input"
      />

      <button
        onClick={handleMatch}
        disabled={loading || !ordersJSON.trim() || transactions.length === 0}
        className="btn-primary"
      >
        {loading ? 'Matching...' : 'Match Orders with Transactions'}
      </button>

      {transactions.length === 0 && (
        <p className="warning">Add some transactions first before matching orders</p>
      )}
    </div>
  );
}
