import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { OrderStats } from '../../../shared/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="mb-8">
        <h1 class="text-2xl font-extrabold text-stone-900">Admin Dashboard</h1>
        <p class="text-stone-500 text-sm mt-1">Overview of your store performance</p>
      </div>

      @if (loading) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse mb-8">
          @for (_ of [1,2,3,4]; track $index) {
            <div class="bg-white rounded-2xl border border-stone-100 p-6 h-28"></div>
          }
        </div>
      }

      @if (!loading) {
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          @for (stat of statCards; track stat.label) {
            <div class="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <div class="flex items-center justify-between mb-3">
                <span class="text-2xl">{{ stat.icon }}</span>
                <span class="text-xs font-semibold px-2 py-1 rounded-full" [class]="stat.badgeClass">{{ stat.badge }}</span>
              </div>
              <p class="text-2xl font-extrabold text-stone-900">{{ stat.value }}</p>
              <p class="text-sm text-stone-500 mt-1">{{ stat.label }}</p>
            </div>
          }
        </div>

        <!-- Order Status Breakdown -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div class="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 class="font-bold text-stone-800 mb-5">Orders by Status</h2>
            <div class="space-y-3">
              @for (item of orderBreakdown; track item.label) {
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-stone-600 flex items-center gap-2">
                      <span>{{ item.icon }}</span> {{ item.label }}
                    </span>
                    <span class="font-semibold text-stone-800">{{ item.count }}</span>
                  </div>
                  <div class="w-full bg-stone-100 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-500" [class]="item.barClass"
                      [style.width]="stats?.total ? (item.count / stats!.total * 100) + '%' : '0%'"></div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 class="font-bold text-stone-800 mb-5">Quick Actions</h2>
            <div class="space-y-3">
              @for (action of quickActions; track action.label) {
                <a [routerLink]="action.link"
                  class="flex items-center gap-4 p-3 rounded-xl border border-stone-100 hover:border-amber-200 hover:bg-amber-50 transition-all group">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    [class]="action.iconBg">{{ action.icon }}</div>
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-stone-800 group-hover:text-amber-700">{{ action.label }}</p>
                    <p class="text-xs text-stone-500">{{ action.desc }}</p>
                  </div>
                  <svg class="w-4 h-4 text-stone-400 group-hover:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </a>
              }
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <div class="flex items-center justify-between mb-5">
            <h2 class="font-bold text-stone-800">Recent Orders</h2>
            <a routerLink="/admin/orders" class="text-sm text-amber-600 font-medium hover:text-amber-700">View all →</a>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs text-stone-500 uppercase tracking-wide border-b border-stone-100">
                  <th class="pb-3 font-semibold">Order ID</th>
                  <th class="pb-3 font-semibold">Customer</th>
                  <th class="pb-3 font-semibold">Items</th>
                  <th class="pb-3 font-semibold">Total</th>
                  <th class="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-50">
                @for (order of recentOrders; track order.id) {
                  <tr class="hover:bg-stone-50 transition-colors">
                    <td class="py-3 font-mono text-xs text-stone-600">{{ order.id.slice(0,8).toUpperCase() }}</td>
                    <td class="py-3">
                      <p class="font-medium text-stone-800">{{ order.userName }}</p>
                      <p class="text-xs text-stone-500">{{ order.userEmail }}</p>
                    </td>
                    <td class="py-3 text-stone-600">{{ order.items.length }}</td>
                    <td class="py-3 font-bold text-stone-900">&#8369;{{ order.total.toFixed(2) }}</td>
                    <td class="py-3">
                      <span class="text-xs font-bold px-2.5 py-1 rounded-full" [class]="getStatusClass(order.status)">
                        {{ order.status | titlecase }}
                      </span>
                    </td>
                  </tr>
                }
                @if (recentOrders.length === 0) {
                  <tr><td colspan="5" class="py-8 text-center text-stone-400 text-sm">No orders yet</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  stats: OrderStats | null = null;
  recentOrders: any[] = [];
  loading = true;
  totalProducts = 0;

  get statCards() {
    return [
      { icon: '💰', label: 'Total Revenue', value: this.formatMoney(this.stats?.revenue || 0), badge: 'All time', badgeClass: 'bg-green-100 text-green-700' },
      { icon: '📦', label: 'Total Orders', value: this.stats?.total || 0, badge: 'Orders', badgeClass: 'bg-blue-100 text-blue-700' },
      { icon: '🛍️', label: 'Total Products', value: this.totalProducts, badge: 'Active', badgeClass: 'bg-amber-100 text-amber-700' },
      { icon: '⏳', label: 'Pending Orders', value: this.stats?.pending || 0, badge: 'Action needed', badgeClass: 'bg-yellow-100 text-yellow-700' },
    ];
  }

  get orderBreakdown() {
    return [
      { label: 'Pending', icon: '⏳', count: this.stats?.pending || 0, barClass: 'bg-yellow-400' },
      { label: 'Confirmed', icon: '✅', count: this.stats?.confirmed || 0, barClass: 'bg-blue-400' },
      { label: 'Shipped', icon: '🚚', count: this.stats?.shipped || 0, barClass: 'bg-indigo-400' },
      { label: 'Delivered', icon: '📦', count: this.stats?.delivered || 0, barClass: 'bg-green-500' },
      { label: 'Cancelled', icon: '❌', count: this.stats?.cancelled || 0, barClass: 'bg-red-400' },
    ];
  }

  quickActions = [
    { icon: '➕', label: 'Add New Product', desc: 'Create a new product listing', link: '/admin/products', iconBg: 'bg-amber-50' },
    { icon: '📋', label: 'Manage Orders', desc: 'View and update order statuses', link: '/admin/orders', iconBg: 'bg-blue-50' },
    { icon: '🏷️', label: 'Manage Products', desc: 'Edit or remove products', link: '/admin/products', iconBg: 'bg-green-50' },
  ];

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      stats: this.orderService.getOrderStats(),
      orders: this.orderService.getAllOrders(1, 5),
      products: this.productService.getProducts({ limit: 1 }),
    }).subscribe({
      next: ({ stats, orders, products }) => {
        this.stats = stats.data!;
        this.recentOrders = orders.data;
        this.totalProducts = products.pagination.total;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
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
    return map[status] || 'bg-stone-100 text-stone-600';
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
