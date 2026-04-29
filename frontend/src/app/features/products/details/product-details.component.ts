import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product, ProductReview, ProductReviewOverview } from '../../../shared/models';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Breadcrumb -->
      <nav class="text-sm text-stone-500 mb-8 flex items-center gap-2">
        <a routerLink="/" class="hover:text-stone-700">Home</a>
        <span>/</span>
        <a routerLink="/products" class="hover:text-stone-700">Shop</a>
        <span>/</span>
        <span class="text-stone-800 font-medium">{{ product?.name }}</span>
      </nav>

      <!-- Loading -->
      @if (loading) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div class="aspect-square bg-stone-200 rounded-2xl"></div>
          <div class="space-y-4 pt-4">
            <div class="h-6 bg-stone-200 rounded w-1/3"></div>
            <div class="h-9 bg-stone-200 rounded w-2/3"></div>
            <div class="h-4 bg-stone-200 rounded"></div>
            <div class="h-4 bg-stone-200 rounded w-5/6"></div>
            <div class="h-10 bg-stone-200 rounded w-1/4 mt-4"></div>
          </div>
        </div>
      }

      <!-- Error -->
      @if (error) {
        <div class="text-center py-20">
          <p class="text-red-500 font-medium">{{ error }}</p>
          <a routerLink="/products" class="mt-4 inline-block text-amber-600 font-semibold hover:underline">← Back to shop</a>
        </div>
      }

      <!-- Product -->
      @if (product && !loading) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <!-- Image -->
          <div class="space-y-3">
            <div class="aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
              <img [src]="selectedImage || product.imageUrl || '/assets/images/placeholders/product.svg'"
                [alt]="product.name" class="w-full h-full object-cover">
            </div>
            @if (product.images && product.images.length > 1) {
              <div class="flex gap-2 overflow-x-auto pb-1">
                @for (img of product.images; track img) {
                  <button (click)="selectedImage = img"
                    class="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all"
                    [class.border-amber-500]="selectedImage === img"
                    [class.border-stone-200]="selectedImage !== img">
                    <img [src]="img" class="w-full h-full object-cover">
                  </button>
                }
              </div>
            }
          </div>

          <!-- Info -->
          <div class="pt-2">
            <div class="flex items-start justify-between gap-4 mb-2">
              <span class="text-sm font-semibold text-amber-600 uppercase tracking-wide bg-amber-50 px-3 py-1 rounded-full">
                {{ product.category }}
              </span>
              @if (product.featured) {
                <span class="text-xs font-bold bg-amber-500 text-white px-2 py-1 rounded-full">⭐ Featured</span>
              }
            </div>

            <h1 class="text-3xl font-extrabold text-stone-900 mb-3 leading-tight">{{ product.name }}</h1>

            <!-- Rating -->
            <div class="flex items-center gap-2 mb-4">
              <div class="flex">
                @for (star of [1,2,3,4,5]; track star) {
                  <svg class="w-4 h-4" [class.text-amber-400]="star <= product.rating" [class.text-stone-200]="star > product.rating" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                }
              </div>
              <span class="text-sm text-stone-500">{{ product.rating.toFixed(1) }} ({{ product.reviewCount }} reviews)</span>
            </div>

            <!-- Price -->
            <div class="flex items-baseline gap-3 mb-5">
              <span class="text-4xl font-extrabold text-stone-900">&#8369;{{ product.price.toFixed(2) }}</span>
              @if (product.originalPrice && product.originalPrice > product.price) {
                <span class="text-xl text-stone-400 line-through">&#8369;{{ product.originalPrice.toFixed(2) }}</span>
                <span class="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  Save {{ getDiscount() }}%
                </span>
              }
            </div>

            <button
              (click)="toggleWishlist()"
              class="inline-flex items-center gap-2 mb-5 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors"
              [class.border-rose-200]="wishlistService.isFavorite(product.id)"
              [class.text-rose-600]="wishlistService.isFavorite(product.id)"
              [class.bg-rose-50]="wishlistService.isFavorite(product.id)"
              [class.border-slate-200]="!wishlistService.isFavorite(product.id)"
              [class.text-slate-700]="!wishlistService.isFavorite(product.id)"
              [class.hover:border-rose-300]="!wishlistService.isFavorite(product.id)">
              <svg class="w-4 h-4" viewBox="0 0 24 24" [attr.fill]="wishlistService.isFavorite(product.id) ? '#e11d48' : 'none'" [attr.stroke]="wishlistService.isFavorite(product.id) ? '#e11d48' : 'currentColor'">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              {{ wishlistService.isFavorite(product.id) ? 'Saved to Wishlist' : 'Save to Wishlist' }}
            </button>

            <!-- Description -->
            <p class="text-stone-600 text-sm leading-relaxed mb-6">{{ product.description }}</p>

            @if (product.poster) {
              <div class="flex items-center gap-3 mb-5 p-3 rounded-xl bg-violet-50 border border-violet-100">
                <img [src]="product.poster.avatar || '/assets/images/placeholders/avatar.svg'"
                  class="w-10 h-10 rounded-full object-cover">
                <div>
                  <p class="text-xs text-stone-500">Posted by</p>
                  <p class="text-sm font-semibold text-stone-800">{{ product.poster.name }}</p>
                </div>
              </div>
            }

            <!-- Tags -->
            @if (product.tags && product.tags.length > 0) {
              <div class="flex flex-wrap gap-2 mb-6">
                @for (tag of product.tags; track tag) {
                  <span class="text-xs bg-stone-100 text-stone-600 px-3 py-1 rounded-full">#{{ tag }}</span>
                }
              </div>
            }

            <!-- Divider -->
            <hr class="border-stone-200 mb-6">

            <!-- Stock -->
            <div class="flex items-center gap-2 mb-5">
              <div class="w-2.5 h-2.5 rounded-full"
                [class.bg-green-500]="product.stock > 5"
                [class.bg-amber-400]="product.stock > 0 && product.stock <= 5"
                [class.bg-red-500]="product.stock === 0">
              </div>
              <span class="text-sm font-medium"
                [class.text-green-700]="product.stock > 5"
                [class.text-amber-600]="product.stock > 0 && product.stock <= 5"
                [class.text-red-600]="product.stock === 0">
                {{ product.stock > 5 ? 'In Stock' : product.stock > 0 ? 'Only ' + product.stock + ' left!' : 'Out of Stock' }}
              </span>
            </div>

            <!-- Quantity + Add to Cart -->
            @if (product.stock > 0) {
              <div class="flex items-center gap-4 mb-4">
                <!-- Qty -->
                <div class="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                  <button (click)="decreaseQty()"
                    class="px-3 py-2 text-stone-600 hover:bg-stone-50 transition-colors font-bold text-lg">−</button>
                  <span class="px-4 py-2 text-sm font-semibold text-stone-800 min-w-[2.5rem] text-center">{{ qty }}</span>
                  <button (click)="increaseQty()"
                    class="px-3 py-2 text-stone-600 hover:bg-stone-50 transition-colors font-bold text-lg">+</button>
                </div>

                @if (authService.isAuthenticated()) {
                  <button (click)="addToCart()" [disabled]="addingToCart"
                    class="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold
                      py-2.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                    @if (addingToCart) {
                      <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Adding...
                    } @else {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      Add to Cart
                    }
                  </button>
                } @else {
                  <a routerLink="/auth/login"
                    class="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold
                      py-2.5 px-6 rounded-xl transition-colors text-center text-sm">
                    Sign in to Add to Cart
                  </a>
                }
              </div>

              @if (addedSuccess) {
                <div class="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-2.5 text-sm flex items-center gap-2">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  Added to cart!
                  <a routerLink="/cart" class="ml-auto font-semibold underline">View Cart →</a>
                </div>
              }

              <div class="mt-8 p-5 rounded-2xl border border-stone-200 bg-white">
                <h3 class="font-bold text-stone-900 text-lg mb-2">Ratings and Reviews</h3>
                <p class="text-sm text-stone-500 mb-4">
                  Average {{ reviewOverview.averageRating.toFixed(1) }} / 5 from {{ reviewOverview.totalReviews }} review(s).
                </p>

                @if (authService.isAuthenticated()) {
                  <div class="mb-5 p-4 rounded-xl bg-stone-50 border border-stone-200">
                    <p class="text-sm font-semibold text-stone-700 mb-2">Rate this product</p>
                    <div class="flex gap-2 mb-3">
                      @for (star of [1,2,3,4,5]; track star) {
                        <button (click)="selectedRating = star" class="text-xl"
                          [class.text-amber-500]="star <= selectedRating"
                          [class.text-stone-300]="star > selectedRating">★</button>
                      }
                    </div>
                    <textarea [(ngModel)]="reviewComment" rows="2" placeholder="Share your experience..."
                      class="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400"></textarea>
                    <button (click)="submitReview()" [disabled]="submittingReview || selectedRating < 1"
                      class="mt-3 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white text-sm font-semibold rounded-lg">
                      {{ submittingReview ? 'Submitting...' : 'Submit Review' }}
                    </button>
                  </div>
                } @else {
                  <a routerLink="/auth/login" class="text-sm text-violet-700 font-semibold hover:underline">Sign in to leave a review</a>
                }

                <div class="space-y-3 mt-4">
                  @for (review of reviews; track review.id) {
                    <article class="p-4 rounded-xl border border-stone-100 bg-stone-50">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <img [src]="review.userAvatar || '/assets/images/placeholders/avatar.svg'"
                            class="w-7 h-7 rounded-full object-cover">
                          <p class="text-sm font-semibold text-stone-800">{{ review.userName }}</p>
                        </div>
                        <p class="text-xs text-stone-500">{{ formatReviewDate(review.createdAt) }}</p>
                      </div>
                      <p class="text-amber-500 text-sm mt-1">{{ '★'.repeat(review.rating) }}<span class="text-stone-300">{{ '★'.repeat(5 - review.rating) }}</span></p>
                      @if (review.comment) {
                        <p class="text-sm text-stone-600 mt-1">{{ review.comment }}</p>
                      }
                    </article>
                  }
                  @if (reviews.length === 0) {
                    <p class="text-sm text-stone-500">No reviews yet. Be the first to rate this product.</p>
                  }
                </div>
              </div>
            }

            <!-- Perks -->
            <div class="grid grid-cols-2 gap-3 mt-6">
              @for (perk of perks; track perk.label) {
                <div class="flex items-center gap-2 text-xs text-stone-600">
                  <span class="text-lg">{{ perk.icon }}</span>
                  <span>{{ perk.label }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  loading = true;
  error = '';
  qty = 1;
  selectedImage = '';
  addingToCart = false;
  addedSuccess = false;
  reviews: ProductReview[] = [];
  reviewOverview: ProductReviewOverview = { averageRating: 0, totalReviews: 0, ratingBreakdown: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } };
  selectedRating = 0;
  reviewComment = '';
  submittingReview = false;

  perks = [
    { icon: '🚚', label: 'Free shipping over &#8369;50' },
    { icon: '↩️', label: '30-day returns' },
    { icon: '🔒', label: 'Secure checkout' },
    { icon: '💬', label: '24/7 support' },
  ];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    public cartService: CartService,
    public authService: AuthService,
    public wishlistService: WishlistService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/products']); return; }
    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.product = res.data!;
        this.wishlistService.syncProduct(this.product);
        this.selectedImage = this.product.imageUrl;
        this.loading = false;
        this.loadReviews();
      },
      error: () => {
        this.error = 'Product not found.';
        this.loading = false;
      },
    });
  }

  addToCart(): void {
    if (!this.product) return;
    this.addingToCart = true;
    this.cartService.addToCart(this.product.id, this.qty).subscribe({
      next: () => {
        this.addingToCart = false;
        this.addedSuccess = true;
        setTimeout(() => this.addedSuccess = false, 3000);
      },
      error: () => { this.addingToCart = false; },
    });
  }

  loadReviews(): void {
    if (!this.product) return;
    this.productService.getProductReviews(this.product.id).subscribe({
      next: (res) => {
        this.reviews = res.data?.reviews || [];
        this.reviewOverview = res.data?.overview || this.reviewOverview;
      },
    });
  }

  submitReview(): void {
    if (!this.product || this.selectedRating < 1) return;
    this.submittingReview = true;
    this.productService.submitProductReview(this.product.id, {
      rating: this.selectedRating,
      comment: this.reviewComment?.trim() || undefined,
    }).subscribe({
      next: () => {
        this.submittingReview = false;
        this.reviewComment = '';
        this.loadReviews();
        this.productService.getProductById(this.product!.id).subscribe((res) => {
          this.product = res.data || this.product;
        });
      },
      error: () => { this.submittingReview = false; },
    });
  }

  decreaseQty(): void {
    if (this.qty > 1) {
      this.qty -= 1;
    }
  }

  increaseQty(): void {
    if (this.product && this.qty < this.product.stock) {
      this.qty += 1;
    }
  }

  getDiscount(): number {
    if (!this.product?.originalPrice) return 0;
    return Math.round((1 - this.product.price / this.product.originalPrice) * 100);
  }

  formatReviewDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  toggleWishlist(): void {
    if (!this.product) return;
    this.wishlistService.toggle(this.product);
  }
}
