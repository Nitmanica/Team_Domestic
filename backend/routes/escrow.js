import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as escrowController from '../controllers/escrowController.js';

const router = Router();
router.post('/escrow/lock', requireAuth, escrowController.lockPayment);
router.post('/escrow/release', requireAuth, escrowController.releasePayment);
export default router;
