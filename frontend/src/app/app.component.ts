import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { WishlistService } from './core/services/wishlist.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-900">
      <header class="sticky top-0 z-50">
        <div class="bg-white border-b border-slate-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-4">
            <a routerLink="/" class="flex items-center gap-2 sm:gap-3 mr-2 md:mr-4">
              <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
              </div>
              <div>
                <p class="text-base sm:text-xl font-black leading-none text-indigo-700">E-commerce</p>
                <p class="text-lg sm:text-2xl leading-none font-black text-violet-600">bazaar</p>
              </div>
            </a>

            <div class="hidden md:flex flex-1 items-center border border-slate-200 rounded-2xl overflow-hidden">
              <input type="text" placeholder="Search for products..."
                class="flex-1 px-4 py-2.5 text-sm outline-none">
              <button type="button"
                class="px-3 py-2.5 border-l border-slate-200 text-sm text-slate-600 inline-flex items-center gap-2 hover:bg-slate-50 transition-colors">
                <span>All Categories</span>
                <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <button class="px-4 py-2.5 bg-violet-600 text-white hover:bg-violet-700 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"/>
                </svg>
              </button>
            </div>

            <div class="flex items-center gap-2 sm:gap-3 ml-auto">
              <a routerLink="/wishlist" class="relative p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                @if (wishlistService.count() > 0) {
                  <span class="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center">
                    {{ wishlistService.count() > 9 ? '9+' : wishlistService.count() }}
                  </span>
                }
              </a>

              @if (authService.isAuthenticated()) {
                <a routerLink="/cart" class="relative p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-violet-700 hover:border-violet-300 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  @if (cartService.itemCount() > 0) {
                    <span class="absolute -top-1 -right-1 bg-violet-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {{ cartService.itemCount() > 9 ? '9+' : cartService.itemCount() }}
                    </span>
                  }
                </a>
              }

              @if (!authService.isAuthenticated()) {
                <a routerLink="/auth/login" class="text-sm font-semibold text-slate-600 hover:text-violet-700">Sign in</a>
                <a routerLink="/auth/register" class="text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl transition-colors">Register</a>
              } @else {
                <div class="relative group">
                  <button class="flex items-center gap-2">
                    <img [src]="authService.currentUser()?.avatar || '/assets/images/placeholders/avatar.svg'"
                      class="w-9 h-9 rounded-full object-cover border border-violet-200">
                    <span class="hidden md:block text-sm font-semibold text-slate-700">{{ authService.currentUser()?.name }}</span>
                  </button>
                  <div class="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150">
                    <a routerLink="/profile" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">My Profile</a>
                    <a routerLink="/orders" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">My Orders</a>
                    <a routerLink="/wishlist" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">My Wishlist</a>
                    @if (authService.isAdmin()) {
                      <a routerLink="/admin" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Admin Panel</a>
                      <a routerLink="/admin/profile" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Admin Profile</a>
                    }
                    <button (click)="logout()" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign out</button>
                  </div>
                </div>
              }
            </div>
          </div>
          <div class="md:hidden px-4 sm:px-6 lg:px-8 pb-3">
            <div class="flex items-center border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <input type="text" placeholder="Search for products..." class="flex-1 px-4 py-2.5 text-sm outline-none">
              <button class="px-4 py-2.5 bg-violet-600 text-white hover:bg-violet-700 transition-colors" aria-label="Search">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white border-b border-slate-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 overflow-x-auto">
            <button class="hidden md:inline-flex items-center gap-2 px-4 py-3 bg-violet-600 text-white text-sm font-semibold rounded-b-xl">
              <span>☰</span> All Categories
              <svg class="w-4 h-4 text-violet-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <nav class="flex min-w-max items-center gap-4 sm:gap-6 text-sm font-semibold">
              <a routerLink="/" routerLinkActive="text-violet-700 border-b-2 border-violet-600" [routerLinkActiveOptions]="{exact:true}" class="py-3 text-slate-600 hover:text-violet-700">Home</a>
              <a routerLink="/products" routerLinkActive="text-violet-700 border-b-2 border-violet-600" [routerLinkActiveOptions]="{exact:false}" class="py-3 text-slate-600 hover:text-violet-700">Shop</a>
              <a routerLink="/wishlist" routerLinkActive="text-violet-700 border-b-2 border-violet-600" class="py-3 text-slate-600 hover:text-violet-700">Wishlist</a>
              @if (authService.isAdmin()) {
                <a routerLink="/admin" routerLinkActive="text-violet-700 border-b-2 border-violet-600" class="py-3 text-slate-600 hover:text-violet-700">Admin</a>
              }
              @if (authService.isAuthenticated()) {
                <a routerLink="/orders" routerLinkActive="text-violet-700 border-b-2 border-violet-600" class="py-3 text-slate-600 hover:text-violet-700">My Orders</a>
                <a routerLink="/profile" routerLinkActive="text-violet-700 border-b-2 border-violet-600" class="py-3 text-slate-600 hover:text-violet-700">My Account</a>
              }
            </nav>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="min-h-[60vh]">
        <router-outlet />
      </main>

      <!-- Footer -->
      <footer class="bg-slate-900 text-slate-400 mt-12 sm:mt-16 lg:mt-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div class="flex items-center gap-2 mb-4">
                <div class="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                </div>
                <span class="text-white font-bold text-lg">Bazaar</span>
              </div>
              <p class="text-sm leading-relaxed">Your modern marketplace for quality products at great prices.</p>
            </div>
            <div>
              <h4 class="text-white font-semibold mb-3 text-sm">Quick Links</h4>
              <ul class="space-y-2 text-sm">
                <li><a routerLink="/products" class="hover:text-white transition-colors">Shop</a></li>
                <li><a routerLink="/wishlist" class="hover:text-white transition-colors">Wishlist</a></li>
                <li><a routerLink="/cart" class="hover:text-white transition-colors">Cart</a></li>
                <li><a routerLink="/orders" class="hover:text-white transition-colors">Orders</a></li>
              </ul>
            </div>
            <div>
              <h4 class="text-white font-semibold mb-3 text-sm">Tech Stack</h4>
              <ul class="space-y-1 text-sm">
                <li>Angular 17 + Tailwind CSS</li>
                <li>Node.js + Express + TypeScript</li>
                <li>Supabase (Postgres + Storage)</li>
                <li>JWT Authentication</li>
              </ul>
            </div>
          </div>
          <div class="border-t border-stone-800 mt-8 pt-6 text-center text-xs">
            <p>&copy; 2026 Bazaar E-Commerce Platform. Created by Menguis John Loyd.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class AppComponent implements OnInit {
  constructor(
    public authService: AuthService,
    public cartService: CartService,
    public wishlistService: WishlistService,
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.cartService.loadCart().subscribe();
    }
  }

  logout(): void {
    this.authService.logout();
    this.cartService.clearLocalCart();
  }
}
