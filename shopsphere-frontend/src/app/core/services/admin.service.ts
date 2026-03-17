import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models';

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalOrders: number;
  totalSales: number;
  averageOrderValue: number;
  orderStatusCount: Record<string, number>;
  averageRating: number;
}

export interface AdminOrder {
  id: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  userEmail: string | null;
  userName: string | null;
  guestEmail: string | null;
  guestName: string | null;
}

export interface AdminItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: { id: number; name: string };
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<SystemStats> {
    return this.http.get<SystemStats>(`${this.base}/stats`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/users`);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.base}/users/${id}`);
  }

  getAllOrders(): Observable<AdminOrder[]> {
    return this.http.get<AdminOrder[]>(`${this.base}/orders`);
  }

  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.base}/orders/${id}/status`, { status });
  }

  getAllItems(page = 0, size = 50): Observable<any> {
    return this.http.get<any>(`${this.base}/items?page=${page}&size=${size}`);
  }

  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.base}/items/${id}`);
  }

  getPendingSellers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/sellers/pending`);
  }

  approveSeller(id: number): Observable<any> {
    return this.http.put(`${this.base}/sellers/${id}/approve`, {});
  }

  rejectSeller(id: number): Observable<any> {
    return this.http.put(`${this.base}/sellers/${id}/reject`, {});
  }
}
