import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';
import { cartItemValidator, cartUpdateValidator, validate } from '../middleware/validation.middleware';

const router = Router();

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Cart retrieved
 */
router.get('/', authenticate, cartController.getCart);

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item added
 */
router.post('/', authenticate, cartItemValidator, validate, cartController.addToCart);

/**
 * @swagger
 * /cart/{productId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart updated
 */
router.put('/:productId', authenticate, cartUpdateValidator, validate, cartController.updateCartItem);

/**
 * @swagger
 * /cart/{productId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Item removed
 */
router.delete('/:productId', authenticate, cartController.removeFromCart);

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.delete('/', authenticate, cartController.clearCart);

export default router;
