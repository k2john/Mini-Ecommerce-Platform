import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { items, shippingAddress, paymentMethod, notes } = req.body;
      const { userId, email, role } = req.user!;
      const userProfile = await import('../services/auth.service').then(m => m.authService.getProfile(userId));
      const order = await orderService.createOrder(userId, email, userProfile.name, items, shippingAddress, paymentMethod, notes);
      sendSuccess(res, 'Order placed successfully', order, 201);
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { orders, total } = await orderService.getUserOrders(req.user!.userId, page, limit);
      sendPaginated(res, orders, total, page, limit, 'Orders retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.role === 'admin' ? undefined : req.user!.userId;
      const order = await orderService.getOrderById(req.params.id, userId);
      sendSuccess(res, 'Order retrieved', order);
    } catch (error) {
      next(error);
    }
  }

  async getAllOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const { orders, total } = await orderService.getAllOrders(page, limit, status);
      sendPaginated(res, orders, total, page, limit, 'All orders retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(req.params.id, status);
      sendSuccess(res, 'Order status updated', order);
    } catch (error) {
      next(error);
    }
  }

  async getOrderStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await orderService.getOrderStats();
      sendSuccess(res, 'Order statistics retrieved', stats);
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
