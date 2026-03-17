import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderRequest, GuestOrderRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  placeOrder(request: OrderRequest): Observable<any> {
    return this.http.post(`${this.base}/user/orders`, request);
  }

  placeGuestOrder(request: GuestOrderRequest): Observable<any> {
    return this.http.post(`${this.base}/public/orders`, request);
  }

  getOrderHistory(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/user/orders/history/${userId}`);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/user/orders/${id}`);
  }

  // Seller
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/seller/orders`);
  }
}
