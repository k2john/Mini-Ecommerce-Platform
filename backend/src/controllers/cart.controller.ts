import { Request, Response, NextFunction } from 'express';
import { cartService } from '../services/cart.service';
import { sendSuccess } from '../utils/response';

export class CartController {
  async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cart = await cartService.getCart(req.user!.userId);
      sendSuccess(res, 'Cart retrieved', cart);
    } catch (error) {
      next(error);
    }
  }

  async addToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId, quantity } = req.body;
      const cart = await cartService.addToCart(req.user!.userId, productId, parseInt(quantity) || 1);
      sendSuccess(res, 'Item added to cart', cart);
    } catch (error) {
      next(error);
    }
  }

  async updateCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const cart = await cartService.updateCartItem(req.user!.userId, productId, parseInt(quantity));
      sendSuccess(res, 'Cart updated', cart);
    } catch (error) {
      next(error);
    }
  }

  async removeFromCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId } = req.params;
      const cart = await cartService.removeFromCart(req.user!.userId, productId);
      sendSuccess(res, 'Item removed from cart', cart);
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await cartService.clearCart(req.user!.userId);
      sendSuccess(res, 'Cart cleared');
    } catch (error) {
      next(error);
    }
  }
}

export const cartController = new CartController();
