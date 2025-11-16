import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';

const router = Router();

router.get('/', TransactionController.getAll);
router.post('/', TransactionController.create);
router.delete('/', TransactionController.deleteAll);
router.delete('/:id', TransactionController.delete);

export default router;
