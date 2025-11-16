import { Router } from 'express';
import orderRoutes from './order.routes';
import transactionRoutes from './transaction.routes';
import pendingTransactionRoutes from './pendingTransaction.routes';
import matchRoutes from './match.routes';

const router = Router();

router.use('/orders', orderRoutes);
router.use('/transactions', transactionRoutes);
router.use('/pending-transactions', pendingTransactionRoutes);
router.use('/match', matchRoutes);

export default router;
