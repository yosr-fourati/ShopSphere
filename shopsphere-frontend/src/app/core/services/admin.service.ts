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
