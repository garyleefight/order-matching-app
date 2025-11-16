import { Request, Response, NextFunction } from 'express';
import { TransactionModel } from '../models/Transaction.model';
import { Transaction } from '../types';
import { AppError } from '../middleware/errorHandler';

export class TransactionController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const transactions = TransactionModel.getAll();
      res.json(transactions);
    } catch (error) {
      next(new Error(String(error)));
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const transactions: Transaction[] = req.body;

      if (!Array.isArray(transactions)) {
        throw new AppError('Request body must be an array of transactions', 400);
      }

      // Validate transactions
      for (const txn of transactions) {
        if (!txn.customer || !txn.orderId || !txn.date || !txn.item ||
            txn.price === undefined || !txn.txnType || txn.txnAmount === undefined) {
          throw new AppError('Missing required fields in transaction', 400);
        }
      }

      const count = TransactionModel.createMany(transactions);

      res.status(201).json({
        message: `${count} transactions created successfully`,
        count
      });
    } catch (error) {
      next(error instanceof AppError ? error : new Error(String(error)));
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = TransactionModel.delete(Number(id));

      if (!deleted) {
        throw new AppError('Transaction not found', 404);
      }

      res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      next(error instanceof AppError ? error : new Error(String(error)));
    }
  }

  static async deleteAll(req: Request, res: Response, next: NextFunction) {
    try {
      const count = TransactionModel.deleteAll();
      res.json({ message: 'All transactions deleted', count });
    } catch (error) {
      next(new Error(String(error)));
    }
  }
}
