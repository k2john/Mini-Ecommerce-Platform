import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../shared/models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-extrabold text-stone-900">Product Management</h1>
          <p class="text-stone-500 text-sm mt-1">{{ totalProducts }} products total</p>
        </div>
        <button (click)="openForm()"
          class="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add Product
        </button>
      </div>

      <!-- Success/Error Toast -->
      @if (toast) {
        <div class="fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all"
          [class.bg-green-500]="toast.type === 'success'"
          [class.bg-red-500]="toast.type === 'error'"
          [class.text-white]="true">
          {{ toast.message }}
        </div>
      }

      <!-- Modal Overlay -->
      @if (showForm) {
        <div class="fixed inset-0 bg-black/50 z-40 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden">
            <div class="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 class="text-lg font-bold text-stone-800">{{ editingProduct ? 'Edit Product' : 'New Product' }}</h2>
              <button (click)="closeForm()" class="text-stone-400 hover:text-stone-600 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form [formGroup]="productForm" (ngSubmit)="saveProduct()" class="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(92vh-80px)]">
              @if (formError) {
                <div class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{{ formError }}</div>
              }

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <label class="block text-sm font-semibold text-stone-700 mb-1.5">Product Name *</label>
                  <input formControlName="name" type="text" placeholder="e.g. Wireless Headphones"
                    class="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50 focus:bg-white"
                    [class.border-red-400]="f['name'].invalid && f['name'].touched">
                </div>

                <div class="sm:col-span-2">
                  <label class="block text-sm font-semibold text-stone-700 mb-1.5">Description *</label>
                  <textarea formControlName="description" rows="3" placeholder="Product description..."
                    class="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50 focus:bg-white resize-none"
                    [class.border-red-400]="f['description'].invalid && f['description'].touched">
                  </textarea>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-stone-700 mb-1.5">Price (PHP) *</label>
                  <input formControlName="price" type="number" step="0.01" min="0" placeholder="0.00"
                    class="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50 focus:bg-white"
                    [class.border-red-400]="f['price'].invalid && f['price'].touched">
                </div>

                <div>
                  <label class="block text-sm font-semibold text-stone-700 mb-1.5">Original Price</label>
                  <input formControlName="originalPrice" type="number" step="0.01" min="0" placeholder="0.00"
                    class="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50 focus:bg-white">
                </div>

                <div>
                  <label class="block text-sm font-semibold text-stone-700 mb-1.5">Category *</label>
                  <div class="relative">
                    <select formControlName="category"
                      class="appearance-none w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50 focus:bg-white pr-10"
                      [class.border-red-400]="f['category'].invalid && f['category'].touched">
                      <option value="" disabled>Select category</option>
                      @for (cat of categoryOptions; track cat) {
                        <option [value]="cat">{{ cat }}</option>
                      }
                    </select>
                    <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-stone-700 mb-1.5">Stock *</label>
                  <input formControlName="stock" type="number" min="0" placeholder="0"
                    class="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50 focus:bg-white"
                    [class.border-red-400]="f['stock'].invalid && f['stock'].touched">
                </div>

                <div class="sm:col-span-2">
                  <label class="block text-sm font-semibold text-stone-700 mb-1.5">Tags (comma-separated)</label>
                  <input formControlName="tags" type="text" placeholder="new, sale, trending"
                    class="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50 focus:bg-white">
                </div>

                <div class="sm:col-span-2">
                  <label class="block text-sm font-semibold text-stone-700 mb-1.5">Product Image</label>
                  <input type="file" accept="image/*" multiple (change)="onFileChange($event)"
                    class="w-full text-sm text-stone-600 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-amber-50 file:text-amber-700 file:font-medium hover:file:bg-amber-100 cursor-pointer">
                  <p class="text-xs text-stone-500 mt-1">You can upload a cover image and additional gallery images.</p>
                  @if (editingProduct?.imageUrl && !newImageFile) {
                    <div class="mt-2 flex items-center gap-2">
                      <img [src]="editingProduct!.imageUrl" class="w-12 h-12 rounded-lg object-cover">
                      <span class="text-xs text-stone-500">Current image</span>
                    </div>
                  }
                </div>

                <div class="flex items-center gap-6">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input formControlName="featured" type="checkbox" class="accent-amber-500 w-4 h-4">
                    <span class="text-sm text-stone-700">Featured</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input formControlName="active" type="checkbox" class="accent-amber-500 w-4 h-4">
                    <span class="text-sm text-stone-700">Active</span>
                  </label>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row gap-3 pt-2 sticky bottom-0 bg-white pb-1">
                <button type="button" (click)="closeForm()"
                  class="flex-1 border border-stone-200 text-stone-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" [disabled]="formLoading"
                  class="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  @if (formLoading) {
                    <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Saving...
                  } @else {
                    {{ editingProduct ? 'Update Product' : 'Create Product' }}
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Product Table -->
      <div class="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        @if (loading) {
          <div class="animate-pulse p-6 space-y-4">
            @for (_ of [1,2,3,4,5]; track $index) {
              <div class="h-14 bg-stone-100 rounded-xl"></div>
            }
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-stone-50 border-b border-stone-100">
                <tr class="text-left text-xs text-stone-500 uppercase tracking-wide">
                  <th class="px-5 py-4 font-semibold">Product</th>
                  <th class="px-5 py-4 font-semibold">Category</th>
                  <th class="px-5 py-4 font-semibold">Price</th>
                  <th class="px-5 py-4 font-semibold">Stock</th>
                  <th class="px-5 py-4 font-semibold">Status</th>
                  <th class="px-5 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-50">
                @for (product of products; track product.id) {
                  <tr class="hover:bg-stone-50 transition-colors">
                    <td class="px-5 py-4">
                      <div class="flex items-center gap-3">
                        <img [src]="product.imageUrl || '/assets/images/placeholders/product.svg'"
                          class="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-stone-100">
                        <div>
                          <p class="font-semibold text-stone-800">{{ product.name }}</p>
                          @if (product.featured) {
                            <span class="text-xs text-amber-600 font-medium">Featured</span>
                          }
                        </div>
                      </div>
                    </td>
                    <td class="px-5 py-4 text-stone-600">{{ product.category }}</td>
                    <td class="px-5 py-4 font-bold text-stone-900">{{ formatCurrency(product.price) }}</td>
                    <td class="px-5 py-4">
                      <span [class.text-red-600]="product.stock === 0"
                            [class.text-amber-600]="product.stock > 0 && product.stock <= 5"
                            [class.text-stone-700]="product.stock > 5"
                            class="font-medium">
                        {{ product.stock }}
                      </span>
                    </td>
                    <td class="px-5 py-4">
                      <span class="text-xs font-bold px-2.5 py-1 rounded-full"
                        [class.bg-green-100]="product.active"
                        [class.text-green-700]="product.active"
                        [class.bg-stone-100]="!product.active"
                        [class.text-stone-500]="!product.active">
                        {{ product.active ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-5 py-4">
                      <div class="flex items-center justify-end gap-2">
                        <button (click)="openForm(product)"
                          class="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                          Edit
                        </button>
                        <button (click)="confirmDelete(product)"
                          class="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
                @if (products.length === 0) {
                  <tr><td colspan="6" class="px-5 py-12 text-center text-stone-400">No products found. Add your first product!</td></tr>
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
                  class="px-3 py-1.5 text-xs border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50">Prev</button>
                <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages"
                  class="px-3 py-1.5 text-xs border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50">Next</button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  showForm = false;
  formLoading = false;
  formError = '';
  editingProduct: Product | null = null;
  newImageFile: File | null = null;
  newImageFiles: File[] = [];
  currentPage = 1;
  totalPages = 1;
  totalProducts = 0;
  toast: { message: string; type: 'success' | 'error' } | null = null;
  categoryOptions = ['Electronics', 'Accessories', 'Furniture', 'Lifestyle', 'Wearables', 'Books', 'Toys', 'Fashion', 'Home & Living', 'Beauty', 'Footwear'];

  productForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    price: [0, [Validators.required, Validators.min(0)]],
    originalPrice: [null as number | null],
    category: ['', Validators.required],
    stock: [0, [Validators.required, Validators.min(0)]],
    tags: [''],
    featured: [false],
    active: [true],
  });

  get f() { return this.productForm.controls; }

  constructor(private fb: FormBuilder, private productService: ProductService) {}

  ngOnInit(): void { this.loadProducts(); }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts({ page: this.currentPage, limit: 15, includeInactive: true }).subscribe({
      next: (res) => {
        this.products = res.data;
        this.totalProducts = res.pagination.total;
        this.totalPages = res.pagination.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        const message = err?.error?.message || err?.message || 'Failed to load products.';
        this.showToast(message, 'error');
      },
    });
  }

  openForm(product?: Product): void {
    this.editingProduct = product || null;
    this.newImageFile = null;
    this.newImageFiles = [];
    this.formError = '';
    if (product) {
      this.productForm.patchValue({
        ...product,
        tags: product.tags?.join(', ') || '',
      });
    } else {
      this.productForm.reset({ active: true, featured: false, price: 0, stock: 0 });
    }
    this.productForm.markAsUntouched();
    this.productForm.markAsPristine();
    this.productForm.updateValueAndValidity();
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingProduct = null;
    this.newImageFile = null;
    this.newImageFiles = [];
  }

  onFileChange(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files || []);
    this.newImageFiles = files;
    this.newImageFile = files[0] || null;
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.formError = 'Please complete all required fields. Description must be at least 10 characters.';
      return;
    }
    this.formLoading = true;
    this.formError = '';

    const formData = new FormData();
    const val = this.productForm.value;
    const parsedPrice = Number(val.price);
    const parsedStock = Number(val.stock);
    const parsedOriginalPrice = val.originalPrice === null || val.originalPrice === undefined
      ? null
      : Number(val.originalPrice);
    const normalizedTags = (val.tags || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .join(', ');

    formData.append('name', String(val.name || '').trim());
    formData.append('description', String(val.description || '').trim());
    formData.append('price', String(Number.isFinite(parsedPrice) ? parsedPrice : 0));
    formData.append('category', String(val.category || '').trim());
    formData.append('stock', String(Number.isFinite(parsedStock) ? parsedStock : 0));
    formData.append('tags', normalizedTags);
    formData.append('featured', String(val.featured));
    formData.append('active', String(val.active));
    if (parsedOriginalPrice !== null && Number.isFinite(parsedOriginalPrice)) {
      formData.append('originalPrice', String(parsedOriginalPrice));
    }
    if (this.newImageFile) formData.append('image', this.newImageFile);
    if (this.newImageFiles.length > 1) {
      this.newImageFiles.slice(1).forEach((file) => formData.append('images', file));
    }

    const obs = this.editingProduct
      ? this.productService.updateProduct(this.editingProduct.id, formData)
      : this.productService.createProduct(formData);

    const isEdit = !!this.editingProduct;
    obs.subscribe({
      next: () => {
        this.formLoading = false;
        this.closeForm();
        if (!isEdit) this.currentPage = 1;
        this.loadProducts();
        this.showToast(isEdit ? 'Product updated!' : 'Product created!', 'success');
      },
      error: (err) => {
        this.formError = err?.error?.errors?.[0] || err?.error?.message || err?.message || 'Failed to save product.';
        this.formLoading = false;
      },
    });
  }

  confirmDelete(product: Product): void {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    this.productService.deleteProduct(product.id).subscribe({
      next: () => { this.loadProducts(); this.showToast('Product deleted', 'success'); },
      error: (err) => this.showToast(err?.error?.message || err?.message || 'Failed to delete product', 'error'),
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadProducts();
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 3001);
  }

  formatCurrency(value: number | string | null | undefined): string {
    const parsed = typeof value === 'number' ? value : Number(value);
    const safe = Number.isFinite(parsed) ? parsed : 0;
    return `₱${safe.toFixed(2)}`;
  }
}

