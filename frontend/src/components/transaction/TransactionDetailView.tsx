import type { Transaction } from '../../types';

interface TransactionDetailViewProps {
  transaction: Transaction;
}

export default function TransactionDetailView({ transaction }: TransactionDetailViewProps) {
  return (
    <div className="detail-grid">
      <div className="detail-item">
        <div className="detail-label">Customer</div>
        <div className="detail-value"><strong>{transaction.customer}</strong></div>
      </div>
      <div className="detail-item">
        <div className="detail-label">Order ID</div>
        <div className="detail-value">{transaction.orderId}</div>
      </div>
      <div className="detail-item">
        <div className="detail-label">Date</div>
        <div className="detail-value">{new Date(transaction.date).toLocaleDateString()}</div>
      </div>
      <div className="detail-item">
        <div className="detail-label">Item</div>
        <div className="detail-value">{transaction.item}</div>
      </div>
      <div className="detail-item">
        <div className="detail-label">Price</div>
        <div className="detail-value">${transaction.price.toFixed(2)}</div>
      </div>
      <div className="detail-item">
        <div className="detail-label">Transaction Type</div>
        <div className="detail-value">{transaction.txnType}</div>
      </div>
      <div className="detail-item">
        <div className="detail-label">Transaction Amount</div>
        <div className="detail-value">${transaction.txnAmount.toFixed(2)}</div>
      </div>
      {transaction.id && (
        <div className="detail-item">
          <div className="detail-label">Database ID</div>
          <div className="detail-value">{transaction.id}</div>
        </div>
      )}
    </div>
  );
}
