import { db } from '../db/database';
import { Transaction } from '../types';

export class TransactionModel {
  static getAll(): Transaction[] {
    return db.prepare(
      'SELECT id, customer, orderId, date, item, price, txnType, txnAmount, order_id FROM transactions'
    ).all() as Transaction[];
  }

  static getById(id: number): Transaction | undefined {
    return db.prepare(
      'SELECT id, customer, orderId, date, item, price, txnType, txnAmount, order_id FROM transactions WHERE id = ?'
    ).get(id) as Transaction | undefined;
  }

  static create(transaction: Transaction, orderId?: number): number {
    const result = db.prepare(`
      INSERT INTO transactions (customer, orderId, date, item, price, txnType, txnAmount, order_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      transaction.customer,
      transaction.orderId,
      transaction.date,
      transaction.item,
      transaction.price,
      transaction.txnType,
      transaction.txnAmount,
      orderId || null
    );

    return result.lastInsertRowid as number;
  }

  static createMany(transactions: Transaction[]): number {
    const insert = db.prepare(`
      INSERT INTO transactions (customer, orderId, date, item, price, txnType, txnAmount)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((transactions: Transaction[]) => {
      for (const txn of transactions) {
        insert.run(txn.customer, txn.orderId, txn.date, txn.item, txn.price, txn.txnType, txn.txnAmount);
      }
    });

    insertMany(transactions);
    return transactions.length;
  }

  static delete(id: number): boolean {
    const result = db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static deleteAll(): number {
    const result = db.prepare('DELETE FROM transactions').run();
    return result.changes;
  }
}
