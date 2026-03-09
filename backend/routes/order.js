import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as orderController from '../controllers/orderController.js';

const router = Router();

router.post('/order', requireAuth, orderController.createOrder);
router.get('/order/:orderId', requireAuth, orderController.getOrder);
router.get('/orders/customer', requireAuth, orderController.getMyOrdersCustomer);
router.get('/orders/driver', requireAuth, orderController.getMyOrdersDriver);
router.get('/orders/available', requireAuth, orderController.getAvailableOrders);
router.patch('/order/:orderId/accept', requireAuth, orderController.acceptOrder);
router.get('/orders/all', requireAuth, requireAdmin, orderController.getAllOrders);

export default router;
