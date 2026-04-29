import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';
import { orderValidator, orderStatusValidator, validate } from '../middleware/validation.middleware';

const router = Router();

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *               shippingAddress:
 *                 $ref: '#/components/schemas/Order'
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order placed
 */
router.post('/', authenticate, orderValidator, validate, orderController.createOrder);

/**
 * @swagger
 * /orders/my:
 *   get:
 *     summary: Get current user's orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Orders list
 */
router.get('/my', authenticate, orderController.getMyOrders);

/**
 * @swagger
 * /orders/all:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: All orders
 */
router.get('/all', authenticate, authorizeAdmin, orderController.getAllOrders);

/**
 * @swagger
 * /orders/stats:
 *   get:
 *     summary: Get order statistics (Admin only)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Statistics
 */
router.get('/stats', authenticate, authorizeAdmin, orderController.getOrderStats);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Order details
 */
router.get('/:id', authenticate, orderController.getOrderById);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', authenticate, authorizeAdmin, orderStatusValidator, validate, orderController.updateOrderStatus);

export default router;
