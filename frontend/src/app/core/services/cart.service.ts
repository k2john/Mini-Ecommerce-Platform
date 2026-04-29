import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, CartItem, ApiResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly API = `${environment.apiUrl}/cart`;

  private _cart = signal<Cart | null>(null);
  readonly cart = this._cart.asReadonly();
  readonly itemCount = computed(() => this._cart()?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0);
  readonly cartTotal = computed(() =>
    this._cart()?.items.reduce((sum, i) => sum + i.price * i.quantity, 0) ?? 0
  );

  constructor(private http: HttpClient) {}

  loadCart(): Observable<ApiResponse<Cart>> {
    return this.http.get<ApiResponse<Cart>>(this.API).pipe(
      tap(res => { if (res.data) this._cart.set(res.data); })
    );
  }

  addToCart(productId: string, quantity: number = 1): Observable<ApiResponse<Cart>> {
    return this.http.post<ApiResponse<Cart>>(this.API, { productId, quantity }).pipe(
      tap(res => { if (res.data) this._cart.set(res.data); })
    );
  }

  updateItem(productId: string, quantity: number): Observable<ApiResponse<Cart>> {
    return this.http.put<ApiResponse<Cart>>(`${this.API}/${productId}`, { quantity }).pipe(
      tap(res => { if (res.data) this._cart.set(res.data); })
    );
  }

  removeItem(productId: string): Observable<ApiResponse<Cart>> {
    return this.http.delete<ApiResponse<Cart>>(`${this.API}/${productId}`).pipe(
      tap(res => { if (res.data) this._cart.set(res.data); })
    );
  }

  clearCart(): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(this.API).pipe(
      tap(() => this._cart.set(null))
    );
  }

  clearLocalCart(): void {
    this._cart.set(null);
  }
}
