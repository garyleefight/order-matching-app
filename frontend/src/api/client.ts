import type { Order, Transaction, MatchResult, PendingTransaction } from '../types';

const API_URL = 'http://localhost:8080';

export const api = {
  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    const response = await fetch(`${API_URL}/api/transactions`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  async createTransaction(transaction: Transaction): Promise<void> {
    const response = await fetch(`${API_URL}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([transaction])
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create transaction');
    }
  },

  async deleteTransaction(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/transactions/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const response = await fetch(`${API_URL}/api/orders`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  async deleteOrder(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/orders/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete order');
  },

  // Matching
  async matchOrders(orders: Order[], transactions: Transaction[]): Promise<MatchResult & { message?: string }> {
    const response = await fetch(`${API_URL}/api/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders, transactions })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to match orders');
    }
    return response.json();
  },

  // Pending Transactions
  async getPendingTransactions(status?: 'pending' | 'approved' | 'rejected'): Promise<PendingTransaction[]> {
    const url = status
      ? `${API_URL}/api/pending-transactions?status=${status}`
      : `${API_URL}/api/pending-transactions`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch pending transactions');
    return response.json();
  },

  async updatePendingTransaction(id: number, updates: Partial<PendingTransaction>): Promise<void> {
    const response = await fetch(`${API_URL}/api/pending-transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update pending transaction');
    }
  },

  async approvePendingTransaction(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/pending-transactions/${id}/approve`, {
      method: 'PUT'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to approve transaction');
    }
  },

  async rejectPendingTransaction(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/pending-transactions/${id}/reject`, {
      method: 'PUT'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reject transaction');
    }
  },

  async deletePendingTransaction(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/pending-transactions/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete pending transaction');
  }
};
