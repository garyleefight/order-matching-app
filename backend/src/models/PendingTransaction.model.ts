import { db } from '../db/database';
import { PendingTransaction, Order } from '../types';

export class PendingTransactionModel {
  static getAll(status?: 'pending' | 'approved' | 'rejected'): PendingTransaction[] {
    let query = `
      SELECT
        pt.*,
        o.customer as order_customer,
        o.orderId as order_orderId,
        o.date as order_date,
        o.item as order_item,
        o.price as order_price
      FROM pending_transactions pt
      LEFT JOIN orders o ON pt.matched_order_id = o.id
    `;
    const params: any[] = [];

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query += ' WHERE pt.status = ?';
      params.push(status);
    }

    query += ' ORDER BY pt.created_at DESC';

    const pendingTxns = db.prepare(query).all(...params);

    // Format the response with matched order info
    return pendingTxns.map((pt: any) => ({
      id: pt.id,
      customer: pt.customer,
      orderId: pt.orderId,
      date: pt.date,
      item: pt.item,
      price: pt.price,
      txnType: pt.txnType,
      txnAmount: pt.txnAmount,
      matched_order_id: pt.matched_order_id,
      matchScore: pt.matchScore,
      status: pt.status,
      submitted_at: pt.submitted_at,
      created_at: pt.created_at,
      updated_at: pt.updated_at,
      matchedOrder: pt.matched_order_id ? {
        customer: pt.order_customer,
        orderId: pt.order_orderId,
        date: pt.order_date,
        item: pt.order_item,
        price: pt.order_price
      } : undefined
    }));
  }

  static getById(id: number): PendingTransaction | undefined {
    return db.prepare('SELECT * FROM pending_transactions WHERE id = ?').get(id) as PendingTransaction | undefined;
  }

  static create(txn: PendingTransaction, orderId: number | null, matchScore: number, status: 'pending' | 'approved' | 'rejected' = 'pending', submittedAt?: string): number {
    const result = db.prepare(`
      INSERT INTO pending_transactions (customer, orderId, date, item, price, txnType, txnAmount, matched_order_id, matchScore, status, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
    `).run(
      txn.customer,
      txn.orderId,
      txn.date,
      txn.item,
      txn.price,
      txn.txnType,
      txn.txnAmount,
      orderId,
      matchScore,
      status,
      submittedAt
    );

    return result.lastInsertRowid as number;
  }

  static update(id: number, updates: Partial<PendingTransaction>): boolean {
    const allowedFields = ['customer', 'orderId', 'date', 'item', 'price', 'txnType', 'txnAmount', 'matched_order_id', 'matchScore'];
    const updateFields: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (updates[field as keyof PendingTransaction] !== undefined) {
        updateFields.push(`${field} = ?`);
        values.push(updates[field as keyof PendingTransaction]);
      }
    }

    if (updateFields.length === 0) {
      return false;
    }

    values.push(id);

    const query = `UPDATE pending_transactions SET ${updateFields.join(', ')} WHERE id = ?`;
    const result = db.prepare(query).run(...values);

    return result.changes > 0;
  }

  static approve(id: number): boolean {
    const result = db.prepare(`
      UPDATE pending_transactions SET status = 'approved' WHERE id = ?
    `).run(id);

    return result.changes > 0;
  }

  static reject(id: number): boolean {
    const result = db.prepare(`
      UPDATE pending_transactions SET status = 'rejected' WHERE id = ? AND status = 'pending'
    `).run(id);

    return result.changes > 0;
  }

  static delete(id: number): boolean {
    const result = db.prepare('DELETE FROM pending_transactions WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
