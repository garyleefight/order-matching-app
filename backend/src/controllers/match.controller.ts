import { Request, Response, NextFunction } from 'express';
import { db } from '../db/database';
import { matchOrders } from '../matcher';
import { OrderModel } from '../models/Order.model';
import { PendingTransactionModel } from '../models/PendingTransaction.model';
import { MatchResult } from '../types';
import { AppError, parseValidationError } from '../middleware/errorHandler';

export class MatchController {
  static async matchOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { orders, transactions } = req.body;

      if (!orders || !transactions) {
        throw new AppError('Both orders and transactions are required', 400);
      }

      try {
        const result: MatchResult = matchOrders(orders, transactions);

        // Save individual matched and unmatched transactions to pending_transactions table
        const saveTransactions = db.transaction((matched: any[], unmatched: any[]) => {
          // Save matched transactions with 'pending' status
          for (const match of matched) {
            const order = match.order;

            // Find the order ID in the orders table
            const existingOrder = OrderModel.getByOrderId(order.orderId);
            const orderId = existingOrder ? existingOrder.id : null;

            // Save each transaction from this match
            for (const txn of match.txns) {
              PendingTransactionModel.create(txn, orderId || null, match.matchScore || 0, 'pending');
            }
          }

          // Save unmatched transactions with 'rejected' status
          for (const txn of unmatched) {
            PendingTransactionModel.create(txn, null, 0, 'rejected');
          }
        });

        // Count total transactions
        const totalPendingTxns = result.matched.reduce((sum, match) => sum + match.txns.length, 0);
        const totalRejectedTxns = result.unmatchedTransactions.length;

        saveTransactions(result.matched, result.unmatchedTransactions);

        res.json({
          ...result,
          message: `${totalPendingTxns} transactions saved to pending review, ${totalRejectedTxns} auto-rejected`
        });
      } catch (error) {
        const err = error as Error;
        throw parseValidationError(err.message);
      }
    } catch (error) {
      next(error instanceof AppError ? error : new Error(String(error)));
    }
  }
}
