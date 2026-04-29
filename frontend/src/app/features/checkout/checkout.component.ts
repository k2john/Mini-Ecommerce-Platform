import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 class="text-2xl font-extrabold text-stone-900 mb-8">Checkout</h1>

      @if (cartService.cart()?.items?.length === 0) {
        <div class="text-center py-16">
          <p class="text-stone-500 mb-4">Your cart is empty.</p>
          <a routerLink="/products" class="text-amber-600 font-semibold hover:underline">← Browse Products</a>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Form -->
          <div class="lg:col-span-2 space-y-6" [formGroup]="checkoutForm">
            <!-- Shipping Address -->
            <div class="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 class="font-bold text-stone-800 text-lg mb-5 flex items-center gap-2">
                <span class="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
                Shipping Address
              </h2>
              <div>
                <div formGroupName="shippingAddress" class="space-y-4">
                  <div>
                    <label class="block text-sm font-semibold text-stone-700 mb-1.5">Street Address</label>
                    <input formControlName="street" type="text" placeholder="123 Main St"
                      class="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none
                        focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50 focus:bg-white"
                      [class.border-red-400]="addr['street'].invalid && addr['street'].touched">
                    @if (addr['street'].invalid && addr['street'].touched) {
                      <p class="text-red-500 text-xs mt-1">Street address is required.</p>
                    }
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-semibold text-stone-700 mb-1.5">City</label>
                      <input formControlName="city" type="text" placeholder="New York"
                        class="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none
                          focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50 focus:bg-white"
                        [class.border-red-400]="addr['city'].invalid && addr['city'].touched">
                      @if (addr['city'].invalid && addr['city'].touched) {
                        <p class="text-red-500 text-xs mt-1">City is required.</p>
                      }
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-stone-700 mb-1.5">State / Province</label>
                      <input formControlName="state" type="text" placeholder="NY"
                        class="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none
                          focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50 focus:bg-white">
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-semibold text-stone-700 mb-1.5">ZIP / Postal Code</label>
                      <input formControlName="zip" type="text" placeholder="10001"
                        class="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none
                          focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50 focus:bg-white">
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-stone-700 mb-1.5">Country</label>
                      <input formControlName="country" type="text" placeholder="United States"
                        class="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none
                          focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50 focus:bg-white"
                        [class.border-red-400]="addr['country'].invalid && addr['country'].touched">
                      @if (addr['country'].invalid && addr['country'].touched) {
                        <p class="text-red-500 text-xs mt-1">Country is required.</p>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 class="font-bold text-stone-800 text-lg mb-5 flex items-center gap-2">
                <span class="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
                Payment Method
              </h2>
              <div class="space-y-3">
                @for (method of paymentMethods; track method.value) {
                  <label class="flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all"
                    [class.border-amber-400]="checkoutForm.get('paymentMethod')?.value === method.value"
                    [class.bg-amber-50]="checkoutForm.get('paymentMethod')?.value === method.value"
                    [class.border-stone-200]="checkoutForm.get('paymentMethod')?.value !== method.value">
                    <input type="radio" [value]="method.value" formControlName="paymentMethod" class="accent-amber-500">
                    <span class="text-xl">{{ method.icon }}</span>
                    <div>
                      <p class="text-sm font-semibold text-stone-800">{{ method.label }}</p>
                      <p class="text-xs text-stone-500">{{ method.desc }}</p>
                    </div>
                  </label>
                }
              </div>
            </div>

            <!-- Notes -->
            <div class="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 class="font-bold text-stone-800 text-base mb-3">Order Notes (optional)</h2>
              <textarea formControlName="notes" rows="3" placeholder="Any special instructions..."
                class="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none
                  focus:ring-2 focus:ring-amber-400 resize-none bg-stone-50 focus:bg-white">
              </textarea>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sticky top-24">
              <h2 class="font-bold text-stone-800 text-lg mb-4">Order Summary</h2>

              <!-- Items -->
              <div class="space-y-3 mb-4 max-h-64 overflow-y-auto">
                @for (item of cartService.cart()?.items; track item.productId) {
                  <div class="flex items-center gap-3">
                    <img [src]="item.imageUrl || '/assets/images/placeholders/product.svg'" class="w-10 h-10 rounded-lg object-cover flex-shrink-0">
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium text-stone-700 truncate">{{ item.name }}</p>
                      <p class="text-xs text-stone-500">Qty: {{ item.quantity }}</p>
                    </div>
                    <span class="text-sm font-semibold text-stone-800 flex-shrink-0">
                      &#8369;{{ (item.price * item.quantity).toFixed(2) }}
                    </span>
                  </div>
                }
              </div>

              <hr class="border-stone-100 mb-3">
              <div class="space-y-2 text-sm mb-4">
                <div class="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>&#8369;{{ cartService.cartTotal().toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span [class.text-green-600]="cartService.cartTotal() >= 50">
                    {{ cartService.cartTotal() >= 50 ? 'FREE' : '&#8369;5.99' }}
                  </span>
                </div>
                <div class="flex justify-between text-stone-600">
                  <span>Tax (10%)</span>
                  <span>&#8369;{{ (cartService.cartTotal() * 0.1).toFixed(2) }}</span>
                </div>
              </div>
              <hr class="border-stone-100 mb-3">
              <div class="flex justify-between font-extrabold text-lg text-stone-900 mb-5">
                <span>Total</span>
                <span>&#8369;{{ getTotal().toFixed(2) }}</span>
              </div>

              @if (error) {
                <div class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 text-xs mb-4">{{ error }}</div>
              }

              <button (click)="placeOrder()" [disabled]="loading"
                class="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold
                  py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                @if (loading) {
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Placing Order...
                } @else {
                  Place Order 🎉
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CheckoutComponent implements OnInit {
  checkoutForm = this.fb.group({
    shippingAddress: this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: [''],
      zip: [''],
      country: ['', Validators.required],
    }),
    paymentMethod: ['cod', Validators.required],
    notes: [''],
  });

  loading = false;
  error = '';

  paymentMethods = [
    { value: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive your order' },
    { value: 'gcash', label: 'GCash', icon: '📱', desc: 'Pay via GCash mobile wallet' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦', desc: 'Direct bank transfer' },
  ];

  get addr() { return (this.checkoutForm.get('shippingAddress') as any).controls; }

  constructor(
    private fb: FormBuilder,
    public cartService: CartService,
    private orderService: OrderService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.cartService.cart()) {
      this.cartService.loadCart().subscribe();
    }
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid) { this.checkoutForm.markAllAsTouched(); return; }
    const cart = this.cartService.cart();
    if (!cart?.items?.length) return;

    this.loading = true;
    this.error = '';

    const orderData = {
      items: cart.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      shippingAddress: this.checkoutForm.value.shippingAddress as any,
      paymentMethod: this.checkoutForm.value.paymentMethod!,
      notes: this.checkoutForm.value.notes || undefined,
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(['/orders', res.data!.id]);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to place order. Please try again.';
        this.loading = false;
      },
    });
  }

  getTotal(): number {
    const sub = this.cartService.cartTotal();
    return sub + (sub >= 50 ? 0 : 5.99) + sub * 0.1;
  }
}
