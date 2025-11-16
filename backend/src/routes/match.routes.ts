import { Router } from 'express';
import { MatchController } from '../controllers/match.controller';

const router = Router();

router.post('/', MatchController.matchOrders);

export default router;
