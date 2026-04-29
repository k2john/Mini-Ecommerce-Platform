import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../shared/models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-extrabold text-stone-900">Order Management</h1>
          <p class="text-stone-500 text-sm mt-1">{{ totalOrders }} orders total</p>
        </div>
        <!-- Status Filter -->
        <select [(ngModel)]="statusFilter" (change)="onStatusFilter()" class="border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-white">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      @if (toast) {
        <div class="fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white"
          [class.bg-green-500]="toast.type === 'success'"
          [class.bg-red-500]="toast.type === 'error'">
          {{ toast.message }}
        </div>
      }

      <div class="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        @if (loading) {
          <div class="animate-pulse p-6 space-y-4">
            @for (_ of [1,2,3,4]; track $index) {
              <div class="h-16 bg-stone-100 rounded-xl"></div>
            }
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-stone-50 border-b border-stone-100">
                <tr class="text-left text-xs text-stone-500 uppercase tracking-wide">
                  <th class="px-5 py-4 font-semibold">Order</th>
                  <th class="px-5 py-4 font-semibold">Customer</th>
                  <th class="px-5 py-4 font-semibold">Items</th>
                  <th class="px-5 py-4 font-semibold">Total</th>
                  <th class="px-5 py-4 font-semibold">Date</th>
                  <th class="px-5 py-4 font-semibold">Status</th>
                  <th class="px-5 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-50">
                @for (order of orders; track order.id) {
                  <tr class="hover:bg-stone-50 transition-colors">
                    <td class="px-5 py-4">
                      <p class="font-mono text-xs text-stone-600 font-bold">{{ order.id.slice(0,8).toUpperCase() }}</p>
                      <p class="text-xs text-stone-400">{{ order.paymentMethod }}</p>
                    </td>
                    <td class="px-5 py-4">
                      <p class="font-semibold text-stone-800">{{ order.userName }}</p>
                      <p class="text-xs text-stone-500">{{ order.userEmail }}</p>
                    </td>
                    <td class="px-5 py-4">
                      <span class="text-stone-700 font-medium">{{ order.items.length }}</span>
                      <span class="text-stone-400 text-xs ml-1">item(s)</span>
                    </td>
                    <td class="px-5 py-4 font-extrabold text-stone-900">&#8369;{{ order.total.toFixed(2) }}</td>
                    <td class="px-5 py-4 text-stone-500 text-xs">{{ formatDate(order.createdAt) }}</td>
                    <td class="px-5 py-4">
                      <span class="text-xs font-bold px-2.5 py-1 rounded-full" [class]="getStatusClass(order.status)">
                        {{ order.status | titlecase }}
                      </span>
                    </td>
                    <td class="px-5 py-4">
                      <div class="flex justify-end">
                        <select
                          [value]="order.status"
                          (change)="onStatusChange(order, $event)"
                          [disabled]="updatingOrder === order.id"
                          class="text-xs border border-stone-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-amber-400 bg-white disabled:opacity-50 cursor-pointer">
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                }
                @if (orders.length === 0) {
                  <tr>
                    <td colspan="7" class="px-5 py-12 text-center text-stone-400">
                      No orders found{{ statusFilter ? ' with status "' + statusFilter + '"' : '' }}.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages > 1) {
            <div class="flex items-center justify-between px-5 py-4 border-t border-stone-100">
              <p class="text-xs text-stone-500">Page {{ currentPage }} of {{ totalPages }}</p>
              <div class="flex gap-2">
                <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1"
                  class="px-3 py-1.5 text-xs border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50">← Prev</button>
                <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages"
                  class="px-3 py-1.5 text-xs border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50">Next →</button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  currentPage = 1;
  totalPages = 1;
  totalOrders = 0;
  statusFilter = '';
  updatingOrder: string | null = null;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAllOrders(this.currentPage, 15, this.statusFilter || undefined).subscribe({
      next: (res) => {
        this.orders = res.data;
        this.totalOrders = res.pagination.total;
        this.totalPages = res.pagination.totalPages;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  onStatusFilter(): void { this.currentPage = 1; this.loadOrders(); }

  onStatusChange(order: Order, event: Event): void {
    const status = (event.target as HTMLSelectElement | null)?.value;
    if (!status) return;
    this.updateStatus(order, status);
  }

  updateStatus(order: Order, status: string): void {
    if (order.status === status) return;
    this.updatingOrder = order.id;
    this.orderService.updateOrderStatus(order.id, status).subscribe({
      next: (res) => {
        order.status = res.data!.status;
        this.updatingOrder = null;
        this.showToast('Order status updated', 'success');
      },
      error: () => {
        this.updatingOrder = null;
        this.showToast('Failed to update status', 'error');
      },
    });
  }

  goToPage(page: number): void { this.currentPage = page; this.loadOrders(); }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 3000);
  }
}
