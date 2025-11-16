import type { Order } from '../../types';

interface OrderDetailViewProps {
  order: Order;
}

export default function OrderDetailView({ order }: OrderDetailViewProps) {
  return (
    <div className="detail-grid">
      <div className="detail-item">
        <div className="detail-label">Customer</div>
        <div className="detail-value"><strong>{order.customer}</strong></div>
      </div>
      <div className="detail-item">
        <div className="detail-label">Order ID</div>
        <div className="detail-value">{order.orderId}</div>
      </div>
      <div className="detail-item">
        <div className="detail-label">Date</div>
        <div className="detail-value">{new Date(order.date).toLocaleDateString()}</div>
      </div>
      <div className="detail-item">
        <div className="detail-label">Item</div>
        <div className="detail-value">{order.item}</div>
      </div>
      <div className="detail-item">
        <div className="detail-label">Price</div>
        <div className="detail-value">${order.price.toFixed(2)}</div>
      </div>
      {order.id && (
        <div className="detail-item">
          <div className="detail-label">Database ID</div>
          <div className="detail-value">{order.id}</div>
        </div>
      )}
    </div>
  );
}
