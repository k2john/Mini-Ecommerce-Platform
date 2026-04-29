import { supabase } from '../config/supabase';
import { Cart, CartItem } from '../types';
import { AppError } from '../middleware/error.middleware';

const CARTS_TABLE = 'carts';
const PRODUCTS_TABLE = 'products';

const mapCartRow = (row: any): Cart => ({
  id: row.id,
  userId: row.user_id,
  items: row.items ?? [],
  updatedAt: new Date(row.updated_at),
});

export class CartService {
  private getProductImageUrl(product: any): string {
    return product.image_url || product.imageUrl || '/assets/images/placeholders/product.svg';
  }

  async getCart(userId: string): Promise<Cart> {
    const { data: cartRow, error } = await supabase.from(CARTS_TABLE).select('*').eq('id', userId).single();
    if (error && error.code !== 'PGRST116') throw new AppError(error.message, 500);

    if (!cartRow) {
      const emptyCart: Cart = { id: userId, userId, items: [], updatedAt: new Date() };
      const { error: insertError } = await supabase.from(CARTS_TABLE).insert({
        id: userId,
        user_id: userId,
        items: [],
        updated_at: emptyCart.updatedAt.toISOString(),
      });
      if (insertError) throw new AppError(insertError.message, 500);
      return emptyCart;
    }

    return mapCartRow(cartRow);
  }

  async addToCart(userId: string, productId: string, quantity: number): Promise<Cart> {
    const { data: product, error: productError } = await supabase.from(PRODUCTS_TABLE).select('*').eq('id', productId).single();
    if (productError || !product) throw new AppError('Product not found', 404);
    if (product.stock < quantity) throw new AppError(`Only ${product.stock} items in stock`, 400);

    const { data: cartRow } = await supabase.from(CARTS_TABLE).select('*').eq('id', userId).single();
    let cart: Cart = cartRow ? mapCartRow(cartRow) : { id: userId, userId, items: [], updatedAt: new Date() };

    const existingIndex = cart.items.findIndex((item) => item.productId === productId);

    if (existingIndex >= 0) {
      const newQty = cart.items[existingIndex].quantity + quantity;
      if (product.stock < newQty) throw new AppError(`Only ${product.stock} items in stock`, 400);
      cart.items[existingIndex].quantity = newQty;
    } else {
      const newItem: CartItem = {
        productId,
        name: product.name,
        price: product.price,
        imageUrl: this.getProductImageUrl(product),
        quantity,
      };
      cart.items.push(newItem);
    }

    cart.updatedAt = new Date();
    const { error } = await supabase.from(CARTS_TABLE).upsert({
      id: cart.id,
      user_id: cart.userId,
      items: cart.items,
      updated_at: cart.updatedAt.toISOString(),
    });
    if (error) throw new AppError(error.message, 500);
    return cart;
  }

  async updateCartItem(userId: string, productId: string, quantity: number): Promise<Cart> {
    const { data: cartRow, error } = await supabase.from(CARTS_TABLE).select('*').eq('id', userId).single();
    if (error || !cartRow) throw new AppError('Cart not found', 404);

    const cart = mapCartRow(cartRow);
    const itemIndex = cart.items.findIndex((item) => item.productId === productId);
    if (itemIndex < 0) throw new AppError('Item not found in cart', 404);

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const { data: product, error: productError } = await supabase.from(PRODUCTS_TABLE).select('*').eq('id', productId).single();
      if (productError || !product) throw new AppError('Product not found', 404);
      if (product.stock < quantity) throw new AppError(`Only ${product.stock} items in stock`, 400);
      cart.items[itemIndex].quantity = quantity;
    }

    cart.updatedAt = new Date();
    const { error: updateError } = await supabase
      .from(CARTS_TABLE)
      .update({ items: cart.items, updated_at: cart.updatedAt.toISOString() })
      .eq('id', userId);
    if (updateError) throw new AppError(updateError.message, 500);
    return cart;
  }

  async removeFromCart(userId: string, productId: string): Promise<Cart> {
    const { data: cartRow, error } = await supabase.from(CARTS_TABLE).select('*').eq('id', userId).single();
    if (error || !cartRow) throw new AppError('Cart not found', 404);

    const cart = mapCartRow(cartRow);
    cart.items = cart.items.filter((item) => item.productId !== productId);
    cart.updatedAt = new Date();
    const { error: updateError } = await supabase
      .from(CARTS_TABLE)
      .update({ items: cart.items, updated_at: cart.updatedAt.toISOString() })
      .eq('id', userId);
    if (updateError) throw new AppError(updateError.message, 500);
    return cart;
  }

  async clearCart(userId: string): Promise<void> {
    const { error } = await supabase.from(CARTS_TABLE).upsert({
      id: userId,
      user_id: userId,
      items: [],
      updated_at: new Date().toISOString(),
    });
    if (error) throw new AppError(error.message, 500);
  }
}

export const cartService = new CartService();
