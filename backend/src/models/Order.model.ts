import { db } from '../db/database';
import { Order } from '../types';

export class OrderModel {
  static getAll(): Order[] {
    return db.prepare('SELECT id, customer, orderId, date, item, price FROM orders').all() as Order[];
  }

  static getById(id: number): Order | undefined {
    return db.prepare('SELECT id, customer, orderId, date, item, price FROM orders WHERE id = ?').get(id) as Order | undefined;
  }

  static getByOrderId(orderId: string): Order | undefined {
    return db.prepare('SELECT id, customer, orderId, date, item, price FROM orders WHERE orderId = ?').get(orderId) as Order | undefined;
  }

  static create(order: Order): number {
    const result = db.prepare(`
      INSERT INTO orders (customer, orderId, date, item, price)
      VALUES (?, ?, ?, ?, ?)
    `).run(order.customer, order.orderId, order.date, order.item, order.price);

    return result.lastInsertRowid as number;
  }

  static createMany(orders: Order[]): number {
    const insert = db.prepare(`
      INSERT INTO orders (customer, orderId, date, item, price)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((orders: Order[]) => {
      for (const order of orders) {
        insert.run(order.customer, order.orderId, order.date, order.item, order.price);
      }
    });

    insertMany(orders);
    return orders.length;
  }

  static delete(id: number): boolean {
    const result = db.prepare('DELETE FROM orders WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static deleteAll(): number {
    const result = db.prepare('DELETE FROM orders').run();
    return result.changes;
  }
}
