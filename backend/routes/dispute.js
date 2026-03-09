import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as disputeController from '../controllers/disputeController.js';

const router = Router();
router.post('/dispute', requireAuth, disputeController.createDispute);
router.get('/disputes', requireAuth, disputeController.listDisputes);
router.post('/admin/dispute/resolve', requireAuth, requireAdmin, disputeController.resolveDispute);
export default router;
