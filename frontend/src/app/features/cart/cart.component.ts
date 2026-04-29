import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../shared/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 class="text-2xl font-extrabold text-stone-900 mb-8">Shopping Cart
        @if (cartService.itemCount() > 0) {
          <span class="text-base font-normal text-stone-500 ml-2">({{ cartService.itemCount() }} items)</span>
        }
      </h1>

      @if (loading) {
        <div class="space-y-4 animate-pulse">
          @for (_ of [1,2,3]; track $index) {
            <div class="bg-white rounded-2xl border border-stone-100 p-5 flex gap-4">
              <div class="w-24 h-24 bg-stone-200 rounded-xl flex-shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-stone-200 rounded w-1/2"></div>
                <div class="h-3 bg-stone-200 rounded w-1/4"></div>
                <div class="h-6 bg-stone-200 rounded w-1/6"></div>
              </div>
            </div>
          }
        </div>
      }

      @if (!loading && cartService.cart()?.items?.length === 0) {
        <div class="text-center py-24">
          <div class="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg class="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-stone-700 mb-2">Your cart is empty</h2>
          <p class="text-stone-500 text-sm mb-6">Looks like you haven't added anything yet.</p>
          <a routerLink="/products"
            class="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
            Browse Products
          </a>
        </div>
      }

      @if (!loading && cartService.cart()?.items?.length! > 0) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Items -->
          <div class="lg:col-span-2 space-y-4">
            @for (item of cartService.cart()!.items; track item.productId) {
              <div class="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex gap-4 items-start">
                <img [src]="item.imageUrl || '/assets/images/placeholders/product.svg'"
                  [alt]="item.name"
                  class="w-24 h-24 rounded-xl object-cover flex-shrink-0 bg-stone-50">
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-stone-800 text-sm leading-tight mb-1 truncate">{{ item.name }}</h3>
                  <p class="text-amber-600 font-bold text-base mb-3">&#8369;{{ item.price.toFixed(2) }}</p>
                  <!-- Quantity Controls -->
                  <div class="flex items-center gap-3">
                    <div class="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                      <button (click)="updateQty(item, item.quantity - 1)"
                        [disabled]="updating[item.productId]"
                        class="px-2.5 py-1 text-stone-600 hover:bg-stone-50 font-bold disabled:opacity-50">−</button>
                      <span class="px-3 py-1 text-sm font-semibold text-stone-800">{{ item.quantity }}</span>
                      <button (click)="updateQty(item, item.quantity + 1)"
                        [disabled]="updating[item.productId]"
                        class="px-2.5 py-1 text-stone-600 hover:bg-stone-50 font-bold disabled:opacity-50">+</button>
                    </div>
                    <button (click)="removeItem(item)"
                      [disabled]="updating[item.productId]"
                      class="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <p class="text-sm text-stone-500">Subtotal</p>
                  <p class="font-extrabold text-stone-900">&#8369;{{ (item.price * item.quantity).toFixed(2) }}</p>
                </div>
              </div>
            }

            <!-- Clear Cart -->
            <div class="flex justify-end">
              <button (click)="clearCart()"
                class="text-sm text-red-400 hover:text-red-600 transition-colors font-medium flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Clear cart
              </button>
            </div>
          </div>

          <!-- Summary -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sticky top-24">
              <h2 class="font-bold text-stone-800 text-lg mb-5">Order Summary</h2>
              <div class="space-y-3 text-sm mb-5">
                <div class="flex justify-between text-stone-600">
                  <span>Subtotal ({{ cartService.itemCount() }} items)</span>
                  <span class="font-medium text-stone-800">&#8369;{{ cartService.cartTotal().toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span class="font-medium" [class.text-green-600]="cartService.cartTotal() >= 50">
                    {{ cartService.cartTotal() >= 50 ? 'FREE' : '&#8369;5.99' }}
                  </span>
                </div>
                <div class="flex justify-between text-stone-600">
                  <span>Tax (10%)</span>
                  <span class="font-medium text-stone-800">&#8369;{{ (cartService.cartTotal() * 0.1).toFixed(2) }}</span>
                </div>
                @if (cartService.cartTotal() < 50) {
                  <div class="bg-amber-50 text-amber-700 text-xs rounded-lg px-3 py-2 border border-amber-100">
                    Add &#8369;{{ (50 - cartService.cartTotal()).toFixed(2) }} more for free shipping!
                  </div>
                }
              </div>
              <hr class="border-stone-200 mb-4">
              <div class="flex justify-between text-stone-900 font-extrabold text-lg mb-5">
                <span>Total</span>
                <span>&#8369;{{ getTotal().toFixed(2) }}</span>
              </div>
              <a routerLink="/checkout"
                class="block w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-center
                  py-3 rounded-xl transition-colors text-sm">
                Proceed to Checkout →
              </a>
              <a routerLink="/products"
                class="block w-full text-center text-sm text-stone-500 hover:text-stone-700 mt-3 transition-colors">
                ← Continue Shopping
              </a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CartComponent implements OnInit {
  loading = true;
  updating: Record<string, boolean> = {};

  constructor(public cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.loadCart().subscribe({ next: () => this.loading = false, error: () => this.loading = false });
  }

  updateQty(item: CartItem, qty: number): void {
    if (qty <= 0) {
      this.removeItem(item);
      return;
    }

    this.updating[item.productId] = true;
    this.cartService.updateItem(item.productId, qty).subscribe({
      next: () => { this.updating[item.productId] = false; },
      error: () => { this.updating[item.productId] = false; },
    });
  }

  removeItem(item: CartItem): void {
    this.updating[item.productId] = true;
    this.cartService.removeItem(item.productId).subscribe({
      next: () => { this.updating[item.productId] = false; },
      error: () => { this.updating[item.productId] = false; },
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe();
  }

  getTotal(): number {
    const sub = this.cartService.cartTotal();
    const shipping = sub >= 50 ? 0 : 5.99;
    const tax = sub * 0.1;
    return sub + shipping + tax;
  }
}
