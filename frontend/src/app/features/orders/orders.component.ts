import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../shared/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 class="text-2xl font-extrabold text-stone-900 mb-8">My Orders</h1>

      @if (loading) {
        <div class="space-y-4 animate-pulse">
          @for (_ of [1,2,3]; track $index) {
            <div class="bg-white rounded-2xl border border-stone-100 p-5 h-28"></div>
          }
        </div>
      }

      @if (!loading && orders.length === 0) {
        <div class="text-center py-24">
          <div class="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg class="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-stone-700 mb-2">No orders yet</h2>
          <p class="text-stone-500 text-sm mb-6">Start shopping and your orders will appear here.</p>
          <a routerLink="/products" class="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
            Shop Now
          </a>
        </div>
      }

      @if (!loading && orders.length > 0) {
        <div class="space-y-4">
          @for (order of orders; track order.id) {
            <a [routerLink]="['/orders', order.id]"
              class="block bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all p-5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-start gap-4">
                  <!-- Status Icon -->
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    [class]="getStatusBg(order.status)">
                    <span class="text-lg">{{ getStatusIcon(order.status) }}</span>
                  </div>
                  <div>
                    <p class="font-semibold text-stone-800 text-sm">Order #{{ order.id.slice(0,8).toUpperCase() }}</p>
                    <p class="text-xs text-stone-500 mt-0.5">{{ order.items.length }} item(s) • {{ formatDate(order.createdAt) }}</p>
                    <div class="flex flex-wrap gap-1 mt-2">
                      @for (item of order.items.slice(0,2); track item.productId) {
                        <span class="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">{{ item.name }}</span>
                      }
                      @if (order.items.length > 2) {
                        <span class="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">+{{ order.items.length - 2 }} more</span>
                      }
                    </div>
                  </div>
                </div>
                <div class="text-right sm:flex-shrink-0">
                  <span class="inline-block text-xs font-bold px-3 py-1 rounded-full mb-2" [class]="getStatusClass(order.status)">
                    {{ order.status | titlecase }}
                  </span>
                  <p class="text-lg font-extrabold text-stone-900">&#8369;{{ order.total.toFixed(2) }}</p>
                </div>
              </div>
            </a>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages > 1) {
          <div class="flex justify-center gap-2 mt-8">
            <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1"
              class="px-4 py-2 text-sm border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50">← Prev</button>
            <span class="px-4 py-2 text-sm font-medium text-stone-600">{{ currentPage }} / {{ totalPages }}</span>
            <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages"
              class="px-4 py-2 text-sm border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50">Next →</button>
          </div>
        }
      }
    </div>
  `,
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  currentPage = 1;
  totalPages = 1;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getMyOrders(this.currentPage, 10).subscribe({
      next: (res) => {
        this.orders = res.data;
        this.totalPages = res.pagination.totalPages;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  goToPage(page: number): void { this.currentPage = page; this.loadOrders(); }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      processing: 'bg-purple-100 text-purple-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-stone-100 text-stone-700';
  }

  getStatusBg(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-yellow-50',
      confirmed: 'bg-blue-50',
      processing: 'bg-purple-50',
      shipped: 'bg-indigo-50',
      delivered: 'bg-green-50',
      cancelled: 'bg-red-50',
    };
    return map[status] || 'bg-stone-50';
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      pending: '⏳', confirmed: '✅', processing: '⚙️',
      shipped: '🚚', delivered: '📦', cancelled: '❌',
    };
    return map[status] || '📋';
  }
}
