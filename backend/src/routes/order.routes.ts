import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';

const router = Router();

router.get('/', OrderController.getAll);
router.post('/', OrderController.create);
router.delete('/', OrderController.deleteAll);
router.delete('/:id', OrderController.delete);

export default router;
