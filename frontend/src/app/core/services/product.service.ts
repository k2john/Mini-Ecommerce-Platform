import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ApiResponse, PaginatedResponse, ProductFilterParams, ProductReview, ProductReviewResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly API = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(filters: ProductFilterParams = {}): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PaginatedResponse<Product>>(this.API, { params });
  }

  getProductById(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.API}/${id}`);
  }

  getCategories(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.API}/categories`);
  }

  getFeaturedProducts(limit: number = 8): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.API}/featured`, {
      params: new HttpParams().set('limit', limit)
    });
  }

  createProduct(formData: FormData): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this.API, formData);
  }

  updateProduct(id: string, formData: FormData): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.API}/${id}`, formData);
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/${id}`);
  }

  getProductReviews(id: string): Observable<ApiResponse<ProductReviewResponse>> {
    return this.http.get<ApiResponse<ProductReviewResponse>>(`${this.API}/${id}/reviews`);
  }

  submitProductReview(id: string, payload: { rating: number; comment?: string }): Observable<ApiResponse<ProductReview>> {
    return this.http.post<ApiResponse<ProductReview>>(`${this.API}/${id}/reviews`, payload);
  }
}
