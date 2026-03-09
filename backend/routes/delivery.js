import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as deliveryController from '../controllers/deliveryController.js';

const router = Router();
router.post('/delivery/proof', requireAuth, deliveryController.uploadProof);
router.post('/delivery/confirm', requireAuth, deliveryController.confirmDelivery);
export default router;
