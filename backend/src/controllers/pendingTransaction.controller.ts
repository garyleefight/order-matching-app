import { Request, Response, NextFunction } from 'express';
import { db } from '../db/database';
import { PendingTransactionModel } from '../models/PendingTransaction.model';
import { OrderModel } from '../models/Order.model';
import { TransactionModel } from '../models/Transaction.model';
import { AppError } from '../middleware/errorHandler';

export class PendingTransactionController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const validStatus = status as 'pending' | 'approved' | 'rejected' | undefined;

      const pendingTransactions = PendingTransactionModel.getAll(validStatus);
      res.json(pendingTransactions);
    } catch (error) {
      next(new Error(String(error)));
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const pendingTxn = PendingTransactionModel.getById(Number(id));

      if (!pendingTxn) {
        throw new AppError('Pending transaction not found', 404);
      }

      const updated = PendingTransactionModel.update(Number(id), updates);

      if (!updated) {
        throw new AppError('No valid fields to update', 400);
      }

      res.json({ message: 'Pending transaction updated successfully' });
    } catch (error) {
      next(error instanceof AppError ? error : new Error(String(error)));
    }
  }

  static async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const pendingTxn = PendingTransactionModel.getById(Number(id));

      if (!pendingTxn) {
        throw new AppError('Pending transaction not found', 404);
      }

      if (pendingTxn.status !== 'pending') {
        throw new AppError(`Transaction already ${pendingTxn.status}`, 400);
      }

      // Use transaction to ensure atomicity
      const approveTransaction = db.transaction(() => {
        let orderId = pendingTxn.matched_order_id;

        // Create order if it doesn't exist
        if (!orderId) {
          orderId = OrderModel.create({
            customer: pendingTxn.customer,
            orderId: pendingTxn.orderId,
            date: pendingTxn.date,
            item: pendingTxn.item,
            price: pendingTxn.price
          });
        }

        // Create transaction linked to order
        TransactionModel.create({
          customer: pendingTxn.customer,
          orderId: pendingTxn.orderId,
          date: pendingTxn.date,
          item: pendingTxn.item,
          price: pendingTxn.price,
          txnType: pendingTxn.txnType,
          txnAmount: pendingTxn.txnAmount
        }, orderId);

        // Mark as approved
        PendingTransactionModel.approve(Number(id));
      });

      approveTransaction();

      res.json({ message: 'Transaction approved and saved successfully' });
    } catch (error) {
      next(error instanceof AppError ? error : new Error(String(error)));
    }
  }

  static async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const rejected = PendingTransactionModel.reject(Number(id));

      if (!rejected) {
        throw new AppError('Pending transaction not found or already processed', 404);
      }

      res.json({ message: 'Transaction rejected successfully' });
    } catch (error) {
      next(error instanceof AppError ? error : new Error(String(error)));
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = PendingTransactionModel.delete(Number(id));

      if (!deleted) {
        throw new AppError('Pending transaction not found', 404);
      }

      res.json({ message: 'Pending transaction deleted successfully' });
    } catch (error) {
      next(error instanceof AppError ? error : new Error(String(error)));
    }
  }
}
