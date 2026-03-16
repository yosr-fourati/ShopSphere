import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { CartItem } from '../../core/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container py-10">
      <h1 class="section-title mb-8">Shopping Cart</h1>

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <div class="card p-5 flex gap-4 animate-pulse">
              <div class="w-20 h-20 bg-gray-200 rounded-xl"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                <div class="h-3 bg-gray-200 rounded w-1/4"></div>
                <div class="h-5 bg-gray-200 rounded w-1/5 mt-2"></div>
              </div>
            </div>
          }
        </div>
      } @else if (!cartItems().length) {
        <div class="text-center py-20">
          <div class="text-7xl mb-4">🛒</div>
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
          <p class="text-gray-400 text-sm mb-8">Discover amazing products and add them to your cart.</p>
          <a routerLink="/products" class="btn-primary">Start Shopping</a>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Items list -->
          <div class="lg:col-span-2 space-y-4">
            @for (ci of cartItems(); track ci.id) {
              <div class="card p-5 flex gap-4 items-center">
                <!-- Image -->
                <div class="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span class="text-3xl">🛍️</span>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-900 truncate">{{ ci.item.name }}</h3>
                  <p class="text-xs text-gray-400 mt-0.5">{{ ci.item.category?.name }}</p>
                  <p class="font-bold text-primary-600 mt-2">\${{ (ci.item.price * ci.quantity) | number:'1.2-2' }}</p>
                </div>

                <!-- Qty controls -->
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button (click)="updateQty(ci, ci.quantity - 1)"
                          [disabled]="ci.quantity <= 1 || updatingId === ci.id"
                          class="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 text-sm font-bold">
                    −
                  </button>
                  <span class="w-8 text-center text-sm font-semibold">{{ ci.quantity }}</span>
                  <button (click)="updateQty(ci, ci.quantity + 1)"
                          [disabled]="ci.quantity >= ci.item.quantity || updatingId === ci.id"
                          class="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 text-sm font-bold">
                    +
                  </button>
                </div>

                <!-- Remove -->
                <button (click)="removeItem(ci)" [disabled]="removingId === ci.id"
                        class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            }
          </div>

          <!-- Order Summary -->
          <div>
            <div class="card p-6 sticky top-20">
              <h2 class="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

              <div class="space-y-3 text-sm">
                <div class="flex justify-between text-gray-600">
                  <span>Items ({{ cartItems().length }})</span>
                  <span>\${{ cartService.getTotal() | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span class="text-green-600 font-medium">Free</span>
                </div>
                <div class="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span>\${{ cartService.getTotal() | number:'1.2-2' }}</span>
                </div>
              </div>

              <button (click)="checkout()" [disabled]="checkingOut()"
                      class="btn-primary w-full mt-6 py-3 text-base disabled:opacity-50">
                {{ checkingOut() ? 'Processing...' : '🔒 Checkout' }}
              </button>

              @if (orderSuccess()) {
                <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 text-center">
                  ✅ Order placed! <a routerLink="/orders" class="font-semibold underline">View Orders</a>
                </div>
              }
              @if (orderError()) {
                <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-center">
                  {{ orderError() }}
                </div>
              }

              <div class="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                Secured by Stripe
              </div>

              <a routerLink="/products" class="block text-center text-sm text-primary-600 hover:underline mt-4">
                ← Continue Shopping
              </a>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CartComponent implements OnInit {
  public cartService = inject(CartService);
  private orderService = inject(OrderService);
  private auth = inject(AuthService);

  cartItems = signal<CartItem[]>([]);
  loading = signal(true);
  updatingId: number | null = null;
  removingId: number | null = null;
  checkingOut = signal(false);
  orderSuccess = signal(false);
  orderError = signal('');

  ngOnInit() {
    const userId = this.auth.getUserId();
    if (!userId) { this.loading.set(false); return; }

    this.cartService.loadCart(userId).subscribe({
      next: (cart) => {
        this.cartItems.set(cart.cartItems ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  updateQty(ci: CartItem, qty: number) {
    const userId = this.auth.getUserId();
    if (!userId || qty < 1) return;
    this.updatingId = ci.id;
    this.cartService.updateCartItem(ci.id, { itemId: ci.item.id, quantity: qty }, userId).subscribe({
      next: () => {
        this.cartItems.update(items => items.map(i => i.id === ci.id ? { ...i, quantity: qty } : i));
        this.updatingId = null;
      },
      error: () => { this.updatingId = null; }
    });
  }

  removeItem(ci: CartItem) {
    const userId = this.auth.getUserId();
    if (!userId) return;
    this.removingId = ci.id;
    this.cartService.removeCartItem(ci.id, userId).subscribe({
      next: () => {
        this.cartItems.update(items => items.filter(i => i.id !== ci.id));
        this.removingId = null;
      },
      error: () => { this.removingId = null; }
    });
  }

  checkout() {
    const userId = this.auth.getUserId();
    if (!userId || !this.cartItems().length) return;
    this.checkingOut.set(true);
    this.orderError.set('');

    const itemIds = this.cartItems().map(ci => ci.item.id);
    this.orderService.placeOrder({ userId, item_id: itemIds }).subscribe({
      next: () => {
        this.checkingOut.set(false);
        this.orderSuccess.set(true);
        this.cartItems.set([]);
        this.cartService.cart.set(null);
      },
      error: (err) => {
        this.checkingOut.set(false);
        this.orderError.set('Failed to place order. Please try again.');
      }
    });
  }
}
