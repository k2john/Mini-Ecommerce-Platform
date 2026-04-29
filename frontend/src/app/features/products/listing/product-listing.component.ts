import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product, ProductFilterParams } from '../../../shared/models';

@Component({
  selector: 'app-product-listing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-gradient-to-r from-violet-100 via-indigo-100 to-fuchsia-100 rounded-3xl p-5 sm:p-8 mb-8 overflow-hidden relative border border-violet-200">
        <div class="absolute inset-0 opacity-40">
          <div class="absolute top-4 right-8 w-40 h-40 rounded-full bg-white"></div>
          <div class="absolute -bottom-8 right-32 w-64 h-64 rounded-full bg-white"></div>
        </div>
        <div class="relative grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <p class="text-violet-700 font-black tracking-[0.2em] text-xs mb-2">BEST DEALS ONLINE</p>
            <h1 class="text-3xl md:text-5xl font-black mb-2 tracking-tight text-slate-900">Shop More,<br><span class="text-violet-600">Save More!</span></h1>
            <p class="text-slate-600 text-base mb-5">Discover amazing products at unbeatable prices.</p>
            <a routerLink="/products" class="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              Shop Now
              <span>></span>
            </a>
          </div>
          <div class="hidden md:flex justify-end">
            <img src="/assets/images/banners/ban.png"
              alt="Shopping banner" class="w-full max-w-md rounded-2xl object-cover h-56">
          </div>
        </div>
        <div class="relative flex flex-wrap gap-3 sm:gap-4 text-sm mt-6">
          <div class="bg-white/70 rounded-xl px-4 py-2 backdrop-blur-sm">
            <span class="font-bold text-lg text-slate-900">{{ totalProducts }}</span>
            <span class="block text-slate-500 text-xs">Products</span>
          </div>
          <div class="bg-white/70 rounded-xl px-4 py-2 backdrop-blur-sm">
            <span class="font-bold text-lg text-slate-900">{{ categories.length }}</span>
            <span class="block text-slate-500 text-xs">Categories</span>
          </div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-4 mb-8">
        <h2 class="font-black text-xl text-slate-900 text-center mb-4">Shop by Categories</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          @for (cat of visibleQuickCategories; track cat.label) {
            <button
              (click)="onCategoryChange(cat.value)"
              class="group text-center rounded-xl p-2 border transition-all"
              [class.border-violet-400]="isCategoryActive(cat.value)"
              [class.bg-violet-50]="isCategoryActive(cat.value)"
              [class.border-transparent]="!isCategoryActive(cat.value)"
              [class.hover:border-violet-200]="!isCategoryActive(cat.value)">
              <div class="w-14 h-14 mx-auto rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                <img [src]="getCategoryImage(cat.label)" [alt]="cat.label + ' category'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
              </div>
              <p class="text-xs mt-2 text-slate-600 group-hover:text-violet-700 font-medium line-clamp-1">{{ cat.label }}</p>
            </button>
          }
          @if (hasHiddenCategories()) {
            <button
              (click)="showMoreCategories()"
              class="group text-center rounded-xl p-2 border border-transparent hover:border-violet-200 transition-all">
              <div class="w-14 h-14 mx-auto rounded-full bg-violet-100 text-violet-700 flex items-center justify-center ring-2 ring-white shadow-sm font-black text-xl">
                +
              </div>
              <p class="text-xs mt-2 text-slate-600 group-hover:text-violet-700 font-medium">More</p>
            </button>
          }
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <aside class="lg:w-64 flex-shrink-0">
          <div class="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 lg:sticky lg:top-24">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-bold text-stone-800">Filters</h2>
              <button (click)="clearFilters()" class="text-xs text-violet-600 hover:text-violet-700 font-medium">Clear all</button>
            </div>

            <div class="mb-5">
              <h3 class="text-sm font-semibold text-stone-600 mb-2 uppercase tracking-wide">Category</h3>
              <div class="space-y-1">
                <label class="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="category" value="" [checked]="!filters.category" (change)="onCategoryChange('')" class="accent-violet-500">
                  <span class="text-sm text-stone-700 group-hover:text-stone-900">All Categories</span>
                </label>
                @for (cat of categories; track cat) {
                  <label class="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="category" [value]="cat" [checked]="filters.category === cat" (change)="onCategoryChange(cat)" class="accent-violet-500">
                    <span class="text-sm text-stone-700 group-hover:text-stone-900">{{ cat }}</span>
                  </label>
                }
              </div>
            </div>

            <div class="mb-5">
              <h3 class="text-sm font-semibold text-stone-600 mb-2 uppercase tracking-wide">Price Range</h3>
              <div class="flex items-center gap-2">
                <input type="number" placeholder="Min" [value]="filters.minPrice || ''" (input)="onPriceChange('min', $event)" class="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-violet-400">
                <span class="text-stone-400">-</span>
                <input type="number" placeholder="Max" [value]="filters.maxPrice || ''" (input)="onPriceChange('max', $event)" class="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-violet-400">
              </div>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-stone-600 mb-2 uppercase tracking-wide">Sort By</h3>
              <select (change)="onSortChange($event)" class="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-violet-400 bg-white">
                <option value="createdAt:desc">Newest First</option>
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
                <option value="name:asc">Name A-Z</option>
                <option value="rating:desc">Top Rated</option>
              </select>
            </div>
          </div>
        </aside>

        <div class="flex-1">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <div class="flex-1 relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input [formControl]="searchControl" type="text" placeholder="Search products..." class="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 bg-white">
            </div>
            <span class="text-sm text-stone-500 sm:whitespace-nowrap">{{ totalProducts }} results</span>
          </div>

          @if (loading) {
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              @for (_ of [1,2,3,4,5,6]; track $index) {
                <div class="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse">
                  <div class="aspect-square bg-stone-200"></div>
                  <div class="p-4 space-y-2">
                    <div class="h-4 bg-stone-200 rounded w-3/4"></div>
                    <div class="h-3 bg-stone-200 rounded w-1/2"></div>
                    <div class="h-5 bg-stone-200 rounded w-1/3"></div>
                  </div>
                </div>
              }
            </div>
          }

          @if (!loading && products.length === 0) {
            <div class="text-center py-20">
              <div class="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-stone-700 mb-1">No products found</h3>
              <p class="text-stone-500 text-sm">Try adjusting your search or filters.</p>
              <button (click)="clearFilters()" class="mt-4 text-violet-600 text-sm font-medium hover:text-violet-700">Clear filters</button>
            </div>
          }

          @if (!loading && products.length > 0) {
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              @for (product of products; track product.id) {
                <div class="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden relative">
                  <button
                    (click)="toggleWishlist(product)"
                    class="absolute z-10 top-3 right-3 w-9 h-9 rounded-full border border-white/70 backdrop-blur-sm bg-white/90 hover:bg-white shadow-sm flex items-center justify-center transition-colors"
                    [attr.aria-label]="wishlistService.isFavorite(product.id) ? 'Remove from wishlist' : 'Add to wishlist'">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" [attr.fill]="wishlistService.isFavorite(product.id) ? '#e11d48' : 'none'" [attr.stroke]="wishlistService.isFavorite(product.id) ? '#e11d48' : 'currentColor'">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                  </button>
                  <a [routerLink]="['/products', product.id]" class="block relative aspect-square overflow-hidden bg-stone-50">
                    <img [src]="product.imageUrl || '/assets/images/placeholders/product.svg'" [alt]="product.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    @if (product.featured) {
                      <span class="absolute top-3 left-3 bg-violet-600 text-white text-xs font-bold px-2 py-1 rounded-full">Featured</span>
                    }
                    @if (product.originalPrice && product.originalPrice > product.price) {
                      <span class="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">-{{ getDiscount(product) }}%</span>
                    }
                  </a>
                  <div class="p-4">
                    <p class="text-xs text-violet-600 font-semibold uppercase tracking-wide mb-1">{{ product.category }}</p>
                    <a [routerLink]="['/products', product.id]" class="block">
                      <h3 class="text-stone-800 font-semibold text-sm leading-tight mb-1 line-clamp-2 hover:text-violet-600 transition-colors">{{ product.name }}</h3>
                    </a>
                    <div class="flex items-center gap-1 mb-3">
                      <div class="flex">
                        @for (star of [1,2,3,4,5]; track star) {
                          <svg class="w-3 h-3" [class.text-amber-400]="star <= product.rating" [class.text-stone-200]="star > product.rating" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        }
                      </div>
                      <span class="text-xs text-stone-500">({{ product.reviewCount }})</span>
                    </div>
                    <div class="flex items-center justify-between mb-2">
                      <div>
                        <span class="text-lg font-extrabold text-stone-900">&#8369;{{ product.price.toFixed(2) }}</span>
                        @if (product.originalPrice && product.originalPrice > product.price) {
                          <span class="text-xs text-stone-400 line-through ml-1">&#8369;{{ product.originalPrice.toFixed(2) }}</span>
                        }
                      </div>
                      @if (authService.isAuthenticated()) {
                        <button (click)="addToCart(product)" [disabled]="product.stock === 0 || addingToCart[product.id]" class="bg-violet-600 hover:bg-violet-700 disabled:bg-stone-200 disabled:text-stone-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                          {{ product.stock === 0 ? 'Out' : 'Add' }}
                        </button>
                      } @else {
                        <a [routerLink]="['/auth/login']" class="bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">Sign in</a>
                      }
                    </div>
                    @if (product.poster) {
                      <div class="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-100 pt-2">
                        <img [src]="product.poster.avatar || '/assets/images/placeholders/avatar.svg'" class="w-5 h-5 rounded-full object-cover">
                        <span>Posted by {{ product.poster.name }}</span>
                      </div>
                    }
                    @if (product.stock > 0 && product.stock <= 5) {
                      <p class="text-xs text-orange-500 mt-1 font-medium">Only {{ product.stock }} left!</p>
                    }
                  </div>
                </div>
              }
            </div>

            @if (totalPages > 1) {
              <div class="flex items-center justify-center gap-2 mt-10">
                <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1" class="px-4 py-2 text-sm font-medium rounded-lg border border-stone-200 disabled:opacity-40 hover:bg-stone-50 transition-colors disabled:cursor-not-allowed">Prev</button>
                @for (page of getPages(); track page) {
                  <button (click)="goToPage(page)" class="w-9 h-9 text-sm font-medium rounded-lg transition-colors" [class.bg-violet-600]="page === currentPage" [class.text-white]="page === currentPage" [class.border]="page !== currentPage" [class.border-stone-200]="page !== currentPage" [class.hover:bg-stone-50]="page !== currentPage">{{ page }}</button>
                }
                <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages" class="px-4 py-2 text-sm font-medium rounded-lg border border-stone-200 disabled:opacity-40 hover:bg-stone-50 transition-colors disabled:cursor-not-allowed">Next</button>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class ProductListingComponent implements OnInit, OnDestroy {
  requiredCategoryButtons = ['Books', 'Toys', 'Fashions', 'Home & Living', 'Beauty', 'Footwear'];
  categoryValueAlias: Record<string, string> = {
    Fashions: 'Fashion',
  };
  products: Product[] = [];
  categories: string[] = [];
  loading = false;
  totalProducts = 0;
  currentPage = 1;
  totalPages = 1;
  addingToCart: Record<string, boolean> = {};
  filters: ProductFilterParams = { page: 1, limit: 12, sortBy: 'createdAt', sortOrder: 'desc' };
  quickCategories: Array<{ label: string; value: string }> = [{ label: 'All', value: '' }];
  visibleQuickCategories: Array<{ label: string; value: string }> = [{ label: 'All', value: '' }];
  showAllQuickCategories = false;
  categoryImageMap: Record<string, string> = {
    All: '/assets/images/categories/all.svg',
    Electronics: '/assets/images/categories/electronics.svg',
    Accessories: '/assets/images/categories/accessories.svg',
    Furniture: '/assets/images/categories/furniture.svg',
    Lifestyle: '/assets/images/categories/lifestyle.svg',
    Wearables: '/assets/images/categories/wearables.svg',
    Books: '/assets/images/categories/books.svg',
    Toys: '/assets/images/categories/toys.svg',
    Fashion: '/assets/images/categories/fashion.svg',
    Fashions: '/assets/images/categories/fashion.svg',
    'Home & Living': '/assets/images/categories/home-living.svg',
    Beauty: '/assets/images/categories/beauty.svg',
    Footwear: '/assets/images/categories/footwear.svg',
  };
  defaultCategoryImage = '/assets/images/placeholders/category.svg';

  searchControl = this.fb.control('');
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    public cartService: CartService,
    public authService: AuthService,
    public wishlistService: WishlistService,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(val => {
      this.filters.search = val || undefined;
      this.filters.page = 1;
      this.currentPage = 1;
      this.loadProducts();
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts({ ...this.filters, page: this.currentPage }).subscribe({
      next: (res) => {
        this.products = res.data;
        this.wishlistService.syncProducts(this.products);
        this.totalProducts = res.pagination.total;
        this.totalPages = res.pagination.totalPages;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe(res => {
      if (!res.data) return;
      this.categories = res.data;
      const seededButtons = this.requiredCategoryButtons.map(label => ({
        label,
        value: this.resolveCategoryValue(label),
      }));
      const seededValues = new Set(seededButtons.map(btn => btn.value));
      const remainingButtons = this.categories
        .filter(category => !seededValues.has(category))
        .map(category => ({ label: category, value: category }));
      this.quickCategories = [{ label: 'All', value: '' }, ...seededButtons, ...remainingButtons];
      this.updateVisibleQuickCategories();
    });
  }

  onCategoryChange(category: string): void {
    this.filters.category = category || undefined;
    this.currentPage = 1;
    this.loadProducts();
  }

  hasHiddenCategories(): boolean {
    return !this.showAllQuickCategories && this.quickCategories.length > 7;
  }

  showMoreCategories(): void {
    this.showAllQuickCategories = true;
    this.updateVisibleQuickCategories();
  }

  updateVisibleQuickCategories(): void {
    this.visibleQuickCategories = this.showAllQuickCategories ? this.quickCategories : this.quickCategories.slice(0, 7);
  }

  onPriceChange(type: 'min' | 'max', event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (type === 'min') this.filters.minPrice = isNaN(val) ? undefined : val;
    else this.filters.maxPrice = isNaN(val) ? undefined : val;
    this.currentPage = 1;
    this.loadProducts();
  }

  onSortChange(event: Event): void {
    const [sortBy, sortOrder] = (event.target as HTMLSelectElement).value.split(':');
    this.filters.sortBy = sortBy;
    this.filters.sortOrder = sortOrder as 'asc' | 'desc';
    this.loadProducts();
  }

  clearFilters(): void {
    this.filters = { page: 1, limit: 12, sortBy: 'createdAt', sortOrder: 'desc' };
    this.currentPage = 1;
    this.searchControl.setValue('');
    this.loadProducts();
  }

  addToCart(product: Product): void {
    this.addingToCart[product.id] = true;
    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => { this.addingToCart[product.id] = false; },
      error: () => { this.addingToCart[product.id] = false; }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  getDiscount(product: Product): number {
    if (!product.originalPrice) return 0;
    return Math.round((1 - product.price / product.originalPrice) * 100);
  }

  isCategoryActive(category: string): boolean {
    return !category ? !this.filters.category : this.filters.category === category;
  }

  getCategoryImage(category: string): string {
    return this.categoryImageMap[category] || this.defaultCategoryImage;
  }

  resolveCategoryValue(label: string): string {
    const alias = this.categoryValueAlias[label] || label;
    if (this.categories.includes(label)) return label;
    if (this.categories.includes(alias)) return alias;
    return alias;
  }

  toggleWishlist(product: Product): void {
    this.wishlistService.toggle(product);
  }
}
