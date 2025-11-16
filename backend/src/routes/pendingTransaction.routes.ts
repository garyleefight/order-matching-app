import { Router } from 'express';
import { PendingTransactionController } from '../controllers/pendingTransaction.controller';

const router = Router();

router.get('/', PendingTransactionController.getAll);
router.put('/:id', PendingTransactionController.update);
router.put('/:id/approve', PendingTransactionController.approve);
router.put('/:id/reject', PendingTransactionController.reject);
router.delete('/:id', PendingTransactionController.delete);

export default router;
