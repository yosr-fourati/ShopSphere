import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Item, Category, Page, Feedback, FeedbackRequest, ItemRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Public endpoints
  getPublicProducts(
    page = 0,
    size = 20,
    search: string | null = null,
    categoryId: number | null = null,
    minPrice: number | null = null,
    maxPrice: number | null = null,
    sortBy = 'id',
    sortDir = 'asc'
  ): Observable<Page<Item>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    if (search) params = params.set('search', search);
    if (categoryId !== null) params = params.set('categoryId', categoryId);
    if (minPrice !== null) params = params.set('minPrice', minPrice);
    if (maxPrice !== null) params = params.set('maxPrice', maxPrice);
    return this.http.get<Page<Item>>(`${this.base}/public/items`, { params });
  }

  getPublicCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/public/categories`);
  }

  searchPublicProducts(query: string, page = 0, size = 20): Observable<Page<Item>> {
    const params = new HttpParams().set('query', query).set('page', page).set('size', size);
    return this.http.get<Page<Item>>(`${this.base}/public/items/search`, { params });
  }

  getPublicProductById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.base}/public/items/${id}`);
  }

  // User endpoints
  getUserProducts(page = 0, size = 20): Observable<Page<Item>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Item>>(`${this.base}/user/items`, { params });
  }

  getProductById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.base}/user/items/${id}`);
  }

  searchProducts(query: string, page = 0, size = 20): Observable<Page<Item>> {
    const params = new HttpParams().set('query', query).set('page', page).set('size', size);
    return this.http.get<Page<Item>>(`${this.base}/user/items/search`, { params });
  }

  getFeedback(itemId: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.base}/user/items/${itemId}/feedback`);
  }

  addFeedback(itemId: number, request: FeedbackRequest): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.base}/user/items/${itemId}/feedback`, request);
  }

  // Seller endpoints
  getSellerProducts(userId: number): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.base}/seller/items/${userId}`);
  }

  createProduct(userId: number, request: ItemRequest): Observable<any> {
    return this.http.post(`${this.base}/seller/items/${userId}`, request);
  }

  updateProduct(itemId: number, request: ItemRequest): Observable<any> {
    return this.http.put(`${this.base}/seller/items/${itemId}`, request);
  }

  deleteProduct(itemId: number): Observable<any> {
    return this.http.delete(`${this.base}/seller/items/${itemId}`);
  }
}
