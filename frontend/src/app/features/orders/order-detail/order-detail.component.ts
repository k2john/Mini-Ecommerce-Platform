import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../shared/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <a routerLink="/orders" class="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 mb-6 transition-colors">
        ← Back to Orders
      </a>

      @if (loading) {
        <div class="animate-pulse space-y-4">
          <div class="h-8 bg-stone-200 rounded w-1/2"></div>
          <div class="h-40 bg-stone-200 rounded-2xl"></div>
          <div class="h-60 bg-stone-200 rounded-2xl"></div>
        </div>
      }

      @if (!loading && order) {
        <!-- Header -->
        <div class="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-xl font-extrabold text-stone-900">Order #{{ order.id.slice(0,8).toUpperCase() }}</h1>
              <p class="text-sm text-stone-500 mt-1">Placed on {{ formatDate(order.createdAt) }}</p>
            </div>
            <span class="inline-block text-sm font-bold px-4 py-1.5 rounded-full" [class]="getStatusClass(order.status)">
              {{ order.status | titlecase }}
            </span>
          </div>

          <!-- Progress Steps -->
          <div class="mt-6">
            <div class="flex items-center justify-between relative">
              <div class="absolute top-3 left-0 right-0 h-0.5 bg-stone-200 -z-0"></div>
              <div class="absolute top-3 left-0 h-0.5 bg-amber-500 -z-0 transition-all"
                [style.width]="getProgressWidth()"></div>
              @for (step of steps; track step.key) {
                <div class="flex flex-col items-center relative z-10">
                  <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                    [class.bg-amber-500]="isCompleted(step.key)"
                    [class.border-amber-500]="isCompleted(step.key)"
                    [class.text-white]="isCompleted(step.key)"
                    [class.bg-white]="!isCompleted(step.key)"
                    [class.border-stone-300]="!isCompleted(step.key)"
                    [class.text-stone-400]="!isCompleted(step.key)">
                    {{ isCompleted(step.key) ? '✓' : '' }}
                  </div>
                  <span class="text-xs mt-1 text-stone-500 hidden sm:block">{{ step.label }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Items -->
        <div class="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-5">
          <h2 class="font-bold text-stone-800 mb-4">Items Ordered</h2>
          <div class="space-y-4">
            @for (item of order.items; track item.productId) {
              <div class="flex items-center gap-4">
                <img [src]="item.imageUrl || '/assets/images/placeholders/product.svg'" class="w-14 h-14 rounded-xl object-cover bg-stone-50">
                <div class="flex-1">
                  <p class="font-semibold text-stone-800 text-sm">{{ item.name }}</p>
                  <p class="text-xs text-stone-500">&#8369;{{ item.price.toFixed(2) }} × {{ item.quantity }}</p>
                </div>
                <p class="font-bold text-stone-900">&#8369;{{ item.subtotal.toFixed(2) }}</p>
              </div>
            }
          </div>

          <hr class="border-stone-100 my-4">
          <div class="space-y-2 text-sm">
            <div class="flex justify-between text-stone-600"><span>Subtotal</span><span>&#8369;{{ order.subtotal.toFixed(2) }}</span></div>
            <div class="flex justify-between text-stone-600">
              <span>Shipping</span>
              <span [class.text-green-600]="order.shipping === 0">{{ order.shipping === 0 ? 'FREE' : '&#8369;' + order.shipping.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-stone-600"><span>Tax</span><span>&#8369;{{ order.tax.toFixed(2) }}</span></div>
          </div>
          <hr class="border-stone-100 my-3">
          <div class="flex justify-between font-extrabold text-lg text-stone-900">
            <span>Total</span>
            <span>&#8369;{{ order.total.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Shipping & Payment -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div class="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h3 class="font-bold text-stone-800 mb-3 text-sm">Shipping Address</h3>
            <div class="text-sm text-stone-600 space-y-1">
              <p>{{ order.shippingAddress.street }}</p>
              <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.zip }}</p>
              <p>{{ order.shippingAddress.country }}</p>
            </div>
          </div>
          <div class="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h3 class="font-bold text-stone-800 mb-3 text-sm">Payment</h3>
            <p class="text-sm text-stone-600">{{ order.paymentMethod | titlecase }}</p>
            @if (order.notes) {
              <p class="text-sm text-stone-500 mt-2"><span class="font-medium">Notes:</span> {{ order.notes }}</p>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;

  steps = [
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];

  private statusOrder = ['pending','confirmed','processing','shipped','delivered'];

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.orderService.getOrderById(id).subscribe({
      next: (res) => { this.order = res.data!; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  isCompleted(stepKey: string): boolean {
    if (!this.order || this.order.status === 'cancelled') return false;
    return this.statusOrder.indexOf(stepKey) <= this.statusOrder.indexOf(this.order.status);
  }

  getProgressWidth(): string {
    if (!this.order || this.order.status === 'cancelled') return '0%';
    const idx = this.statusOrder.indexOf(this.order.status);
    return `${(idx / (this.statusOrder.length - 1)) * 100}%`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
}
