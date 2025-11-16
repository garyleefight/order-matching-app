import type { Transaction } from '../../types';

interface Props {
  transactions: Transaction[];
  onDelete: (id: number) => void;
}

export default function TransactionList({ transactions, onDelete }: Props) {
  return (
    <div className="transaction-list">
      <h3>Current Transactions ({transactions.length})</h3>
      {transactions.length === 0 ? (
        <p className="empty-state">No transactions yet. Add one above!</p>
      ) : (
        <div className="list">
          {transactions.map((txn) => (
            <div key={txn.id} className="list-item">
              <div className="item-content">
                <div className="item-primary">
                  <strong>{txn.customer}</strong>
                  <span className="item-id">{txn.orderId}</span>
                </div>
                <div className="item-secondary">
                  <span>{txn.item}</span>
                  <span className="item-price">${txn.price.toFixed(2)}</span>
                </div>
                <div className="item-meta">
                  <span className="txn-type">{txn.txnType}</span>
                  <span className="txn-amount">${txn.txnAmount.toFixed(2)}</span>
                  <span className="item-date">{txn.date}</span>
                </div>
              </div>
              <button
                onClick={() => txn.id && onDelete(txn.id)}
                className="btn-delete"
                title="Delete transaction"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
