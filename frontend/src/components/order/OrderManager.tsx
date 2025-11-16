import { useState, useEffect } from 'react';
import type { Order } from '../../types';
import { api } from '../../api/client';
import SortableTable, { type Column } from '../modal/SortableTable';
import Modal from '../modal/Modal';
import OrderDetailView from './OrderDetailView';

const orderColumns: Column<Order>[] = [
  {
    key: 'customer',
    header: 'Customer',
    render: (order) => <strong>{order.customer}</strong>,
    sortFn: (a, b) => a.customer.localeCompare(b.customer)
  },
  {
    key: 'orderId',
    header: 'Order ID',
    render: (order) => order.orderId,
    sortFn: (a, b) => a.orderId.localeCompare(b.orderId)
  },
  {
    key: 'date',
    header: 'Date',
    render: (order) => order.date,
    sortFn: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  },
  {
    key: 'item',
    header: 'Item',
    render: (order) => order.item,
    sortFn: (a, b) => a.item.localeCompare(b.item)
  },
  {
    key: 'price',
    header: 'Price',
    render: (order) => `$${order.price.toFixed(2)}`,
    sortFn: (a, b) => a.price - b.price
  }
];

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [showJsonInput, setShowJsonInput] = useState<boolean>(false);
  const [showManualEntry, setShowManualEntry] = useState<boolean>(false);
  const [manualOrders, setManualOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order>({
    customer: '',
    orderId: '',
    date: '',
    item: '',
    price: 0
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    }
  };

  const validateAndImportOrders = async (data: unknown) => {
    // Validate that it's an array
    if (!Array.isArray(data)) {
      throw new Error('JSON must contain an array of orders');
    }

    // Validate each order has required fields
    const requiredFields = ['customer', 'orderId', 'date', 'item', 'price'];
    for (const order of data) {
      for (const field of requiredFields) {
        if (!(field in order)) {
          throw new Error(`Order missing required field: ${field}`);
        }
      }
    }

    // Import orders
    const response = await fetch('http://localhost:8080/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to import orders');
    }

    await loadOrders();
    setSuccess(`Successfully imported ${data.length} order(s)`);
    setError(null);

    setTimeout(() => setSuccess(null), 3000);
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await validateAndImportOrders(data);
      event.target.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import orders');
      setSuccess(null);
    }
  };

  const handleJsonPaste = async () => {
    try {
      const data = JSON.parse(jsonInput);
      await validateAndImportOrders(data);
      setJsonInput('');
      setShowJsonInput(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import orders');
      setSuccess(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteOrder(id);
      await loadOrders();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
    }
  };

  const handleAddToList = () => {
    // Validate current order
    if (!currentOrder.customer || !currentOrder.orderId || !currentOrder.date || !currentOrder.item || !currentOrder.price) {
      setError('Please fill in all fields');
      return;
    }

    // Add to manual orders list
    setManualOrders([...manualOrders, currentOrder]);

    // Reset form
    setCurrentOrder({
      customer: '',
      orderId: '',
      date: '',
      item: '',
      price: 0
    });

    setError(null);
    setSuccess(`Order added to list (${manualOrders.length + 1} total)`);
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleRemoveFromList = (index: number) => {
    setManualOrders(manualOrders.filter((_, i) => i !== index));
  };

  const handleSubmitManualOrders = async () => {
    if (manualOrders.length === 0) {
      setError('No orders to submit');
      return;
    }

    try {
      await validateAndImportOrders(manualOrders);
      setManualOrders([]);
      setShowManualEntry(false);
      setCurrentOrder({
        customer: '',
        orderId: '',
        date: '',
        item: '',
        price: 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit orders');
      setSuccess(null);
    }
  };

  const handleCancelManualEntry = () => {
    setManualOrders([]);
    setShowManualEntry(false);
    setCurrentOrder({
      customer: '',
      orderId: '',
      date: '',
      item: '',
      price: 0
    });
  };

  return (
    <div className="transaction-manager">
      <h2>Manage Orders</h2>
      <p className="description">
        Import your orders from JSON. These will be used to match against incoming transactions.
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

      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="file-upload" className="btn-primary" style={{ display: 'inline-block', cursor: 'pointer' }}>
          Import from File
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".json"
          onChange={handleFileImport}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => setShowJsonInput(!showJsonInput)}
          className="btn-primary"
          style={{ marginLeft: '1rem' }}
        >
          {showJsonInput ? 'Hide JSON Input' : 'Paste JSON'}
        </button>
        <button
          onClick={() => setShowManualEntry(!showManualEntry)}
          className="btn-primary"
          style={{ marginLeft: '1rem' }}
        >
          {showManualEntry ? 'Hide Manual Entry' : 'Add Manually'}
        </button>
        <span style={{ marginLeft: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
          Upload a JSON file, paste JSON, or add orders manually
        </span>
      </div>

      {showJsonInput && (
        <div style={{ marginBottom: '1.5rem' }}>
          <textarea
            className="json-input"
            placeholder='Paste JSON array here, e.g., [{"customer":"John","orderId":"123","date":"2024-01-15","item":"Product A","price":99.99}]'
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={10}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button onClick={handleJsonPaste} className="btn-primary">
              Import JSON
            </button>
            <button
              onClick={() => {
                setJsonInput('');
                setShowJsonInput(false);
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showManualEntry && (
        <div style={{ marginBottom: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', background: '#f9fafb' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Add Order Manually</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Customer Name *</label>
              <input
                type="text"
                value={currentOrder.customer}
                onChange={(e) => setCurrentOrder({ ...currentOrder, customer: e.target.value })}
                placeholder="e.g., John Doe"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Order ID *</label>
              <input
                type="text"
                value={currentOrder.orderId}
                onChange={(e) => setCurrentOrder({ ...currentOrder, orderId: e.target.value })}
                placeholder="e.g., ORD-12345"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Date *</label>
              <input
                type="date"
                value={currentOrder.date}
                onChange={(e) => setCurrentOrder({ ...currentOrder, date: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Item *</label>
              <input
                type="text"
                value={currentOrder.item}
                onChange={(e) => setCurrentOrder({ ...currentOrder, item: e.target.value })}
                placeholder="e.g., Product A"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentOrder.price || ''}
                onChange={(e) => setCurrentOrder({ ...currentOrder, price: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., 99.99"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button onClick={handleAddToList} className="btn-primary">
              Add to List
            </button>
          </div>

          {manualOrders.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>Orders to Submit ({manualOrders.length})</h4>
              <div style={{ background: 'white', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                {manualOrders.map((order, index) => (
                  <div key={index} style={{ padding: '0.75rem', borderBottom: index < manualOrders.length - 1 ? '1px solid #e5e7eb' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{order.customer}</strong> - {order.orderId} - {order.item} - ${order.price.toFixed(2)}
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{order.date}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveFromList(index)}
                      style={{ padding: '0.25rem 0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={handleSubmitManualOrders} className="btn-primary">
                  Submit All ({manualOrders.length} orders)
                </button>
                <button
                  onClick={handleCancelManualEntry}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="transaction-list">
        <h3>Current Orders ({orders.length})</h3>
        <SortableTable
          data={orders}
          columns={orderColumns}
          actions={(order) => (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setSelectedOrder(order)}
                className="btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                title="View details"
              >
                View
              </button>
              <button
                onClick={() => order.id && handleDelete(order.id)}
                className="btn-delete"
                title="Delete order"
              >
                ×
              </button>
            </div>
          )}
          emptyMessage="No orders yet. Import orders using the buttons above!"
          defaultSortKey="customer"
        />
      </div>

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
