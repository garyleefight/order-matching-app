import { Request, Response, NextFunction } from 'express';
import { db } from '../db/database';
import { matchOrders, shouldAutoApprove } from '../matcher';
import { OrderModel } from '../models/Order.model';
import { TransactionModel } from '../models/Transaction.model';
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

        let autoApprovedCount = 0;
        let pendingCount = 0;
        let rejectedCount = 0;

        // Get server-side timestamp for submission
        const submittedAt = new Date().toISOString();

        // Save individual matched and unmatched transactions to pending_transactions table
        const saveTransactions = db.transaction((matched: any[], unmatched: any[]) => {
          // Save matched transactions - auto-approve if score is high enough
          for (const match of matched) {
            const order = match.order;

            // Find the order ID in the orders table
            const existingOrder = OrderModel.getByOrderId(order.orderId);
            const orderId = existingOrder ? existingOrder.id : null;

            // Save each transaction from this match
            for (const txn of match.txns) {
              // Check if this transaction should be auto-approved
              const autoApprove = shouldAutoApprove(order, txn);
              // Use the individual transaction's match score
              const txnMatchScore = txn.matchScore || 0;

              if (autoApprove && orderId) {
                // Auto-approve: apply auto-fix to align fields with the matched order
                const fixedTxn = {
                  ...txn,
                  customer: order.customer,  // Auto-fix to match order
                  orderId: order.orderId,     // Auto-fix to match order
                  item: order.item            // Auto-fix to match order
                };

                // Save to transactions table AND pending_transactions with 'approved' status
                TransactionModel.create(fixedTxn, orderId);
                PendingTransactionModel.create(fixedTxn, orderId, txnMatchScore, 'approved', submittedAt);
                autoApprovedCount++;
              } else {
                // Save to pending_transactions with 'pending' status for manual review
                PendingTransactionModel.create(txn, orderId || null, txnMatchScore, 'pending', submittedAt);
                pendingCount++;
              }
            }
          }

          // Save unmatched transactions with 'rejected' status
          for (const txn of unmatched) {
            PendingTransactionModel.create(txn, null, 0, 'rejected', submittedAt);
            rejectedCount++;
          }
        });

        saveTransactions(result.matched, result.unmatchedTransactions);

        res.json({
          ...result,
          message: `${autoApprovedCount} auto-approved, ${pendingCount} sent to pending review, ${rejectedCount} auto-rejected`,
          autoApprovedCount,
          pendingCount,
          rejectedCount
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
