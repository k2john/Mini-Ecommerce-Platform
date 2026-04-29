import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, CreateOrderRequest, ApiResponse, PaginatedResponse, OrderStats } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly API = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(data: CreateOrderRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.API, data);
  }

  getMyOrders(page: number = 1, limit: number = 10): Observable<PaginatedResponse<Order>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<PaginatedResponse<Order>>(`${this.API}/my`, { params });
  }

  getOrderById(id: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.API}/${id}`);
  }

  getAllOrders(page: number = 1, limit: number = 10, status?: string): Observable<PaginatedResponse<Order>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (status) params = params.set('status', status);
    return this.http.get<PaginatedResponse<Order>>(`${this.API}/all`, { params });
  }

  updateOrderStatus(id: string, status: string): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${this.API}/${id}/status`, { status });
  }

  getOrderStats(): Observable<ApiResponse<OrderStats>> {
    return this.http.get<ApiResponse<OrderStats>>(`${this.API}/stats`);
  }
}
