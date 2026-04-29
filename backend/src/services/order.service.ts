import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';
import { Order, OrderItem, Address } from '../types';
import { AppError } from '../middleware/error.middleware';
import { cartService } from './cart.service';

const ORDERS_TABLE = 'orders';
const PRODUCTS_TABLE = 'products';

const mapOrderRow = (row: any): Order => ({
  id: row.id,
  userId: row.user_id,
  userEmail: row.user_email,
  userName: row.user_name,
  items: row.items ?? [],
  subtotal: row.subtotal,
  shipping: row.shipping,
  tax: row.tax,
  total: row.total,
  status: row.status,
  shippingAddress: row.shipping_address,
  paymentMethod: row.payment_method,
  notes: row.notes ?? undefined,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

export class OrderService {
  private getProductImageUrl(product: any): string {
    return product.image_url || product.imageUrl || '/assets/images/placeholders/product.svg';
  }

  async createOrder(
    userId: string,
    userEmail: string,
    userName: string,
    items: { productId: string; quantity: number }[],
    shippingAddress: Address,
    paymentMethod: string,
    notes?: string
  ): Promise<Order> {
    const orderId = uuidv4();
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    // Validate stock and build order items
    for (const item of items) {
      const { data: product, error: productError } = await supabase.from(PRODUCTS_TABLE).select('*').eq('id', item.productId).single();
      if (productError || !product) throw new AppError(`Product ${item.productId} not found`, 404);
      if (product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, 400);
      }

      const subtotalItem = product.price * item.quantity;
      orderItems.push({
        productId: item.productId,
        name: product.name,
        price: product.price,
        imageUrl: this.getProductImageUrl(product),
        quantity: item.quantity,
        subtotal: subtotalItem,
      });
      subtotal += subtotalItem;
    }

    const shipping = subtotal >= 50 ? 0 : 5.99;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    const now = new Date();
    const order: Order = {
      id: orderId,
      userId,
      userEmail,
      userName,
      items: orderItems,
      subtotal,
      shipping,
      tax,
      total,
      status: 'pending',
      shippingAddress,
      paymentMethod,
      notes,
      createdAt: now,
      updatedAt: now,
    };

    const { error: orderInsertError } = await supabase.from(ORDERS_TABLE).insert({
      id: order.id,
      user_id: order.userId,
      user_email: order.userEmail,
      user_name: order.userName,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: order.tax,
      total: order.total,
      status: order.status,
      shipping_address: order.shippingAddress,
      payment_method: order.paymentMethod,
      notes: order.notes ?? null,
      created_at: order.createdAt.toISOString(),
      updated_at: order.updatedAt.toISOString(),
    });
    if (orderInsertError) throw new AppError(orderInsertError.message, 500);

    // Deduct stock
    for (const item of items) {
      const { data: product, error: productError } = await supabase.from(PRODUCTS_TABLE).select('stock').eq('id', item.productId).single();
      if (productError || !product) throw new AppError(`Product ${item.productId} not found`, 404);
      const { error: updateError } = await supabase
        .from(PRODUCTS_TABLE)
        .update({ stock: product.stock - item.quantity, updated_at: new Date().toISOString() })
        .eq('id', item.productId);
      if (updateError) throw new AppError(updateError.message, 500);
    }

    // Clear cart
    await cartService.clearCart(userId);

    return order;
  }

  async getOrderById(id: string, userId?: string): Promise<Order> {
    const { data, error } = await supabase.from(ORDERS_TABLE).select('*').eq('id', id).single();
    if (error || !data) throw new AppError('Order not found', 404);
    const order = mapOrderRow(data);
    if (userId && order.userId !== userId) throw new AppError('Access denied', 403);
    return order;
  }

  async getUserOrders(userId: string, page: number = 1, limit: number = 10): Promise<{ orders: Order[]; total: number }> {
    const { data, error } = await supabase.from(ORDERS_TABLE).select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw new AppError(error.message, 500);
    const orders = (data || []).map(mapOrderRow);

    const total = orders.length;
    const start = (page - 1) * limit;
    return { orders: orders.slice(start, start + limit), total };
  }

  async getAllOrders(page: number = 1, limit: number = 10, status?: string): Promise<{ orders: Order[]; total: number }> {
    let query = supabase.from(ORDERS_TABLE).select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw new AppError(error.message, 500);
    const orders = (data || []).map(mapOrderRow);

    const total = orders.length;
    const start = (page - 1) * limit;
    return { orders: orders.slice(start, start + limit), total };
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const { error: updateError } = await supabase
      .from(ORDERS_TABLE)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    if (updateError) throw new AppError(updateError.message, 500);

    const { data, error } = await supabase.from(ORDERS_TABLE).select('*').eq('id', orderId).single();
    if (error || !data) throw new AppError('Order not found', 404);
    return mapOrderRow(data);
  }

  async getOrderStats(): Promise<any> {
    const { data, error } = await supabase.from(ORDERS_TABLE).select('*');
    if (error) throw new AppError(error.message, 500);
    const orders = (data || []).map(mapOrderRow);

    const stats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      confirmed: orders.filter((o) => o.status === 'confirmed').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
      revenue: orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0),
    };

    return stats;
  }
}

export const orderService = new OrderService();
