import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../shared/models';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900">My Wishlist</h1>
          <p class="text-sm text-slate-500 mt-1">{{ wishlistService.count() }} saved product(s)</p>
        </div>
        <a routerLink="/products" class="text-sm font-semibold text-violet-700 hover:text-violet-800">
          Continue Shopping
        </a>
      </div>

      @if (wishlistService.products().length === 0) {
        <div class="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <div class="w-16 h-16 mx-auto rounded-full bg-violet-100 flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <h2 class="text-lg font-bold text-slate-900 mb-1">Your wishlist is empty</h2>
          <p class="text-slate-500 text-sm mb-5">Save products you love and find them here anytime.</p>
          <a routerLink="/products" class="inline-flex items-center px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors">
            Browse Products
          </a>
        </div>
      }

      @if (wishlistService.products().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          @for (product of wishlistService.products(); track product.id) {
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <a [routerLink]="['/products', product.id]" class="block relative aspect-square bg-slate-50">
                <img [src]="product.imageUrl || '/assets/images/placeholders/product.svg'" [alt]="product.name" class="w-full h-full object-cover">
              </a>
              <div class="p-4">
                <p class="text-xs text-violet-600 font-semibold uppercase tracking-wide mb-1">{{ product.category }}</p>
                <a [routerLink]="['/products', product.id]" class="block text-sm font-semibold text-slate-900 line-clamp-2 hover:text-violet-700 transition-colors mb-2">
                  {{ product.name }}
                </a>
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <span class="text-lg font-extrabold text-slate-900">&#8369;{{ product.price.toFixed(2) }}</span>
                    @if (product.originalPrice && product.originalPrice > product.price) {
                      <span class="text-xs text-slate-400 line-through ml-1">&#8369;{{ product.originalPrice.toFixed(2) }}</span>
                    }
                  </div>
                  <button (click)="wishlistService.remove(product.id)" class="text-xs font-semibold text-rose-600 hover:text-rose-700">
                    Remove
                  </button>
                </div>

                @if (authService.isAuthenticated()) {
                  <button
                    (click)="addToCart(product)"
                    [disabled]="product.stock === 0 || addingToCart[product.id]"
                    class="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors">
                    {{ product.stock === 0 ? 'Out of Stock' : addingToCart[product.id] ? 'Adding...' : 'Add to Cart' }}
                  </button>
                } @else {
                  <a routerLink="/auth/login" class="block w-full text-center bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors">
                    Sign in to Add
                  </a>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class WishlistComponent {
  addingToCart: Record<string, boolean> = {};

  constructor(
    public wishlistService: WishlistService,
    public authService: AuthService,
    private cartService: CartService,
  ) {}

  addToCart(product: Product): void {
    this.addingToCart[product.id] = true;
    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
        this.addingToCart[product.id] = false;
      },
      error: () => {
        this.addingToCart[product.id] = false;
      },
    });
  }
}
