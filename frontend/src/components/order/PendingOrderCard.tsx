import type { PendingOrder } from '../../types';

interface Props {
  order: PendingOrder;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function PendingOrderCard({ order, onApprove, onReject, onDelete }: Props) {
  const statusColor = {
    pending: '#fbbf24',
    approved: '#10b981',
    rejected: '#ef4444'
  };

  return (
    <div className={`pending-order-card status-${order.status}`}>
      <div className="card-header">
        <div className="order-info">
          <h3>{order.customer}</h3>
          <span className="order-id">Order ID: {order.orderId}</span>
        </div>
        <div className="status-badge" style={{ backgroundColor: statusColor[order.status] }}>
          {order.status}
        </div>
      </div>

      <div className="card-body">
        <div className="order-details">
          <p><strong>Item:</strong> {order.item}</p>
          <p><strong>Price:</strong> ${order.price.toFixed(2)}</p>
          <p><strong>Date:</strong> {order.date}</p>
          {order.matchScore !== undefined && (
            <p><strong>Match Score:</strong> {order.matchScore}%</p>
          )}
        </div>

        <div className="matched-transactions">
          <h4>Matched Transactions ({order.matchedTransactions.length})</h4>
          {order.matchedTransactions.map((txn, idx) => (
            <div key={idx} className="transaction-item">
              <div>
                <strong>{txn.customer}</strong> - {txn.orderId}
              </div>
              <div className="txn-details">
                <span>{txn.txnType}</span>
                <span>${txn.txnAmount.toFixed(2)}</span>
                <span>{txn.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="timestamps">
          {order.created_at && (
            <span className="timestamp">Created: {new Date(order.created_at).toLocaleString()}</span>
          )}
          {order.updated_at && order.updated_at !== order.created_at && (
            <span className="timestamp">Updated: {new Date(order.updated_at).toLocaleString()}</span>
          )}
        </div>
      </div>

      <div className="card-actions">
        {order.status === 'pending' && (
          <>
            <button onClick={() => order.id && onApprove(order.id)} className="btn-approve">
              Approve
            </button>
            <button onClick={() => order.id && onReject(order.id)} className="btn-reject">
              Reject
            </button>
          </>
        )}
        <button onClick={() => order.id && onDelete(order.id)} className="btn-delete">
          Delete
        </button>
      </div>
    </div>
  );
}
