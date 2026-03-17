import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, CartItemRequest, GuestCartItem, Item } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private base = environment.apiUrl;
  private GUEST_CART_KEY = 'shopsphere_guest_cart';

  // API-backed cart (logged-in users)
  cart = signal<Cart | null>(null);

  // localStorage-backed cart (guests)
  guestItems = signal<GuestCartItem[]>([]);

  // Unified cart item count for the navbar badge
  cartCount = computed(() => {
    const apiCount = this.cart()?.cartItems?.length ?? 0;
    const guestCount = this.guestItems().length;
    return apiCount + guestCount;
  });

  constructor(private http: HttpClient) {
    this.loadGuestCartFromStorage();
  }

  // ── Guest cart (localStorage) ─────────────────────────────────────────────

  private loadGuestCartFromStorage() {
    try {
      const raw = localStorage.getItem(this.GUEST_CART_KEY);
      if (raw) this.guestItems.set(JSON.parse(raw));
    } catch {
      this.guestItems.set([]);
    }
  }

  private persistGuestCart() {
    localStorage.setItem(this.GUEST_CART_KEY, JSON.stringify(this.guestItems()));
  }

  addGuestItem(item: Item, quantity: number) {
    const existing = this.guestItems().find(gi => gi.item.id === item.id);
    if (existing) {
      this.guestItems.update(items =>
        items.map(gi => gi.item.id === item.id
          ? { ...gi, quantity: Math.min(gi.quantity + quantity, gi.item.quantity) }
          : gi)
      );
    } else {
      this.guestItems.update(items => [...items, { item, quantity }]);
    }
    this.persistGuestCart();
  }

  removeGuestItem(itemId: number) {
    this.guestItems.update(items => items.filter(gi => gi.item.id !== itemId));
    this.persistGuestCart();
  }

  updateGuestItemQty(itemId: number, quantity: number) {
    if (quantity < 1) {
      this.removeGuestItem(itemId);
      return;
    }
    this.guestItems.update(items =>
      items.map(gi => gi.item.id === itemId ? { ...gi, quantity } : gi)
    );
    this.persistGuestCart();
  }

  clearGuestCart() {
    this.guestItems.set([]);
    localStorage.removeItem(this.GUEST_CART_KEY);
  }

  getGuestTotal(): number {
    return this.guestItems().reduce((sum, gi) => sum + gi.item.price * gi.quantity, 0);
  }

  // ── API cart (authenticated users) ───────────────────────────────────────

  loadCart(userId: number): Observable<Cart> {
    return this.http.get<Cart>(`${this.base}/user/cart/${userId}`).pipe(
      tap(cart => this.cart.set(cart))
    );
  }

  addToCart(userId: number, request: CartItemRequest): Observable<any> {
    return this.http.post(`${this.base}/user/cart/items/${userId}`, request).pipe(
      tap(() => this.loadCart(userId).subscribe())
    );
  }

  updateCartItem(cartItemId: number, request: CartItemRequest, userId: number): Observable<any> {
    return this.http.put(`${this.base}/user/cart/items/${cartItemId}`, request).pipe(
      tap(() => this.loadCart(userId).subscribe())
    );
  }

  removeCartItem(cartItemId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.base}/user/cart/items/${cartItemId}`).pipe(
      tap(() => this.loadCart(userId).subscribe())
    );
  }

  clearCart(userId: number): Observable<any> {
    return this.http.delete(`${this.base}/user/cart/${userId}`).pipe(
      tap(() => this.cart.set(null))
    );
  }

  getTotal(): number {
    return this.cart()?.cartItems?.reduce(
      (sum, ci) => sum + ci.item.price * ci.quantity, 0
    ) ?? 0;
  }
}
