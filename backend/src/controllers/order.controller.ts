import { Request, Response, NextFunction } from 'express';
import { OrderModel } from '../models/Order.model';
import { Order } from '../types';
import { AppError } from '../middleware/errorHandler';

export class OrderController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = OrderModel.getAll();
      res.json(orders);
    } catch (error) {
      next(new Error(String(error)));
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const orders: Order[] = req.body;

      if (!Array.isArray(orders)) {
        throw new AppError('Request body must be an array of orders', 400);
      }

      // Validate orders
      for (const order of orders) {
        if (!order.customer || !order.orderId || !order.date || !order.item || order.price === undefined) {
          throw new AppError('Missing required fields in order', 400);
        }
      }

      const count = OrderModel.createMany(orders);

      res.status(201).json({
        message: `${count} orders created successfully`,
        count
      });
    } catch (error) {
      next(error instanceof AppError ? error : new Error(String(error)));
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = OrderModel.delete(Number(id));

      if (!deleted) {
        throw new AppError('Order not found', 404);
      }

      res.json({ message: 'Order deleted successfully' });
    } catch (error) {
      next(error instanceof AppError ? error : new Error(String(error)));
    }
  }

  static async deleteAll(req: Request, res: Response, next: NextFunction) {
    try {
      const count = OrderModel.deleteAll();
      res.json({ message: 'All orders deleted', count });
    } catch (error) {
      next(new Error(String(error)));
    }
  }
}
