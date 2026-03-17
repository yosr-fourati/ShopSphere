import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { CartItem, DeliveryAddress } from '../../core/models';
import { getProductImage } from '../../core/utils/product-images';
import { environment } from '../../../environments/environment';

// Stripe.js loaded via CDN in index.html
declare var Stripe: any;

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-container py-10">
      <h1 class="section-title mb-8">Shopping Cart</h1>

      <!-- Loading skeleton -->
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

      <!-- Order success -->
      } @else if (orderDone()) {
        <div class="max-w-md mx-auto text-center py-16">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p class="text-gray-500 mb-1">Your payment was successful and your order is confirmed.</p>
          @if (guestEmail()) {
            <p class="text-sm text-gray-400 mt-2">
              A confirmation will be sent to <strong>{{ guestEmail() }}</strong>
            </p>
          } @else {
            <a routerLink="/orders" class="text-primary-600 text-sm font-medium hover:underline">
              View order history →
            </a>
          }
          <a routerLink="/products" class="btn-primary mt-6 inline-block">Continue Shopping</a>
        </div>

      <!-- Empty cart -->
      } @else if (isEmpty()) {
        <div class="text-center py-20">
          <div class="text-7xl mb-4">🛒</div>
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
          <p class="text-gray-400 text-sm mb-8">Discover amazing products and add them to your cart.</p>
          <a routerLink="/products" class="btn-primary">Start Shopping</a>
        </div>

      <!-- Cart items -->
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Items list -->
          <div class="lg:col-span-2 space-y-4">
            @for (ci of unifiedItems(); track ci.item.id) {
              <div class="card p-5 flex gap-4 items-center">
                <div class="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <img [src]="getImg(ci.item)" [alt]="ci.item.name"
                       class="w-full h-full object-cover"
                       (error)="onImgError($event)" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-900 truncate">{{ ci.item.name }}</h3>
                  <p class="text-xs text-gray-400 mt-0.5">{{ ci.item.category?.name }}</p>
                  <p class="font-bold text-primary-600 mt-2">\${{ (ci.item.price * ci.quantity) | number:'1.2-2' }}</p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button (click)="decreaseQty(ci)" [disabled]="ci.quantity <= 1 || showPaymentForm()"
                          class="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-lg
                                 hover:bg-gray-50 disabled:opacity-40 text-sm font-bold">−</button>
                  <span class="w-8 text-center text-sm font-semibold">{{ ci.quantity }}</span>
                  <button (click)="increaseQty(ci)"
                          [disabled]="ci.quantity >= ci.item.quantity || showPaymentForm()"
                          class="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-lg
                                 hover:bg-gray-50 disabled:opacity-40 text-sm font-bold">+</button>
                </div>
                <button (click)="removeItem(ci)" [disabled]="showPaymentForm()"
                        class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg
                               transition-colors disabled:opacity-40">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5
                             4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            }
          </div>

          <!-- Order summary + checkout panel -->
          <div>
            <div class="card p-6 sticky top-20">
              <h2 class="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

              <div class="space-y-3 text-sm">
                <div class="flex justify-between text-gray-600">
                  <span>Items ({{ unifiedItems().length }})</span>
                  <span>\${{ getUnifiedTotal() | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span class="text-green-600 font-medium">Free</span>
                </div>
                <div class="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span>\${{ getUnifiedTotal() | number:'1.2-2' }}</span>
                </div>
              </div>

              <!-- ── LOGGED-IN CHECKOUT ── -->
              @if (auth.isLoggedIn()) {

                @if (!showPaymentForm()) {
                  <button (click)="proceedToPayment()" [disabled]="checkingOut()"
                          class="btn-primary w-full mt-6 py-3 text-base disabled:opacity-50">
                    @if (checkingOut()) {
                      <span class="flex items-center justify-center gap-2">
                        <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Initializing payment...
                      </span>
                    } @else {
                      🔒 Place Order
                    }
                  </button>

                } @else {
                  <!-- Stripe Card Form (logged-in) -->
                  <div class="mt-5 border-t border-gray-100 pt-5">
                    <p class="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                      </svg>
                      Payment Details
                    </p>
                    <div id="stripe-card-element"
                         class="p-3 border border-gray-300 rounded-lg bg-white min-h-[42px]">
                      <!-- Stripe card element mounts here -->
                    </div>
                    @if (!isProd) {
                      <p class="text-xs text-gray-400 mt-1.5">
                        Test card: 4242 4242 4242 4242 · Any future date · Any CVC
                      </p>
                    }
                    <button (click)="payAndPlaceOrder()" [disabled]="checkingOut()"
                            class="btn-primary w-full mt-4 py-3 text-base disabled:opacity-50">
                      @if (checkingOut()) {
                        <span class="flex items-center justify-center gap-2">
                          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Processing payment...
                        </span>
                      } @else {
                        💳 Pay \${{ getUnifiedTotal() | number:'1.2-2' }}
                      }
                    </button>
                    <button (click)="cancelPayment()"
                            class="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-2">
                      ← Back to cart
                    </button>
                  </div>
                }

              <!-- ── GUEST CHECKOUT ── -->
              } @else {

                @if (!showGuestForm()) {
                  <button (click)="showGuestForm.set(true)"
                          class="btn-primary w-full mt-6 py-3 text-base">
                    Proceed to Checkout
                  </button>
                  <div class="mt-3 text-center text-xs text-gray-400">
                    or <a routerLink="/auth/login" class="text-primary-600 font-medium hover:underline">sign in</a>
                    for order tracking
                  </div>

                } @else if (!showPaymentForm()) {
                  <!-- Guest details form -->
                  <div class="mt-5 border-t border-gray-100 pt-5 space-y-2.5">
                    <p class="text-sm font-semibold text-gray-800 mb-3">Your Details</p>
                    <input [(ngModel)]="guest.name" name="guestName" type="text"
                           placeholder="Full name *" class="input-field text-sm"/>
                    <input [(ngModel)]="guest.email" name="guestEmail" type="email"
                           placeholder="Email address *" class="input-field text-sm"/>
                    <p class="text-xs font-semibold text-gray-600 pt-1">Delivery Address</p>
                    <input [(ngModel)]="guest.street" name="street" type="text"
                           placeholder="Street address *" class="input-field text-sm"/>
                    <div class="grid grid-cols-2 gap-2">
                      <input [(ngModel)]="guest.city" name="city" type="text"
                             placeholder="City *" class="input-field text-sm"/>
                      <input [(ngModel)]="guest.state" name="state" type="text"
                             placeholder="State / Region" class="input-field text-sm"/>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                      <input [(ngModel)]="guest.postalCode" name="postalCode" type="text"
                             placeholder="Postal code *" class="input-field text-sm"/>
                      <input [(ngModel)]="guest.country" name="country" type="text"
                             placeholder="Country *" class="input-field text-sm"/>
                    </div>
                    <button (click)="proceedToPayment()"
                            [disabled]="checkingOut() || !isGuestFormValid()"
                            class="btn-primary w-full py-3 text-base disabled:opacity-50 mt-1">
                      @if (checkingOut()) {
                        <span class="flex items-center justify-center gap-2">
                          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Initializing payment...
                        </span>
                      } @else {
                        Continue to Payment →
                      }
                    </button>
                    <button type="button" (click)="showGuestForm.set(false)"
                            class="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-1">
                      ← Back to summary
                    </button>
                  </div>

                } @else {
                  <!-- Stripe Card Form (guest) -->
                  <div class="mt-5 border-t border-gray-100 pt-5">
                    <div class="bg-gray-50 rounded-lg px-3 py-2 mb-3 text-xs text-gray-500">
                      <span class="font-medium text-gray-700">{{ guest.name }}</span> · {{ guest.email }}
                    </div>
                    <p class="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                      </svg>
                      Payment Details
                    </p>
                    <div id="stripe-card-element"
                         class="p-3 border border-gray-300 rounded-lg bg-white min-h-[42px]">
                      <!-- Stripe card element mounts here -->
                    </div>
                    @if (!isProd) {
                      <p class="text-xs text-gray-400 mt-1.5">
                        Test card: 4242 4242 4242 4242 · Any future date · Any CVC
                      </p>
                    }
                    <button (click)="payAndPlaceOrder()" [disabled]="checkingOut()"
                            class="btn-primary w-full mt-4 py-3 text-base disabled:opacity-50">
                      @if (checkingOut()) {
                        <span class="flex items-center justify-center gap-2">
                          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Processing payment...
                        </span>
                      } @else {
                        💳 Pay \${{ getUnifiedTotal() | number:'1.2-2' }}
                      }
                    </button>
                    <button (click)="cancelPayment()"
                            class="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-2">
                      ← Back to details
                    </button>
                  </div>
                }
              }

              <!-- Error message -->
              @if (orderError()) {
                <div class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex gap-2">
                  <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  <span>{{ orderError() }}</span>
                </div>
              }

              <!-- Security badge -->
              <div class="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                Secured by Stripe
              </div>

              @if (!showPaymentForm()) {
                <a routerLink="/products" class="block text-center text-sm text-primary-600 hover:underline mt-4">
                  ← Continue Shopping
                </a>
              }
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
  public auth = inject(AuthService);
  private http = inject(HttpClient);

  readonly isProd = environment.production;

  loading = signal(true);
  checkingOut = signal(false);
  orderDone = signal(false);
  orderError = signal('');
  showGuestForm = signal(false);
  showPaymentForm = signal(false);
  guestEmail = signal('');

  apiItems = signal<CartItem[]>([]);

  // Stripe state
  private stripe: any = null;
  private cardElement: any = null;
  private clientSecret = '';

  guest = {
    name: '', email: '', street: '', city: '', state: '', postalCode: '', country: ''
  };

  // ── Helpers ───────────────────────────────────────────────────

  getImg(item: any): string { return getProductImage(item); }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src =
      'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=400&fit=crop';
  }

  unifiedItems(): Array<{ item: any; quantity: number }> {
    return this.auth.isLoggedIn() ? this.apiItems() : this.cartService.guestItems();
  }

  isEmpty(): boolean { return this.unifiedItems().length === 0; }

  getUnifiedTotal(): number {
    return this.unifiedItems().reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  }

  isGuestFormValid(): boolean {
    return !!(this.guest.name && this.guest.email &&
              this.guest.street && this.guest.city &&
              this.guest.postalCode && this.guest.country);
  }

  // ── Lifecycle ─────────────────────────────────────────────────

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      const userId = this.auth.getUserId();
      if (!userId) { this.loading.set(false); return; }
      this.cartService.loadCart(userId).subscribe({
        next: cart => { this.apiItems.set(cart.cartItems ?? []); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  // ── Cart operations ───────────────────────────────────────────

  increaseQty(ci: { item: any; quantity: number }) {
    if (this.auth.isLoggedIn()) {
      const apiItem = this.apiItems().find(a => a.item.id === ci.item.id);
      if (!apiItem) return;
      const userId = this.auth.getUserId()!;
      this.cartService.updateCartItem(apiItem.id, { itemId: ci.item.id, quantity: ci.quantity + 1 }, userId)
        .subscribe({ next: () => this.apiItems.update(items =>
            items.map(i => i.item.id === ci.item.id ? { ...i, quantity: i.quantity + 1 } : i)) });
    } else {
      this.cartService.updateGuestItemQty(ci.item.id, ci.quantity + 1);
    }
  }

  decreaseQty(ci: { item: any; quantity: number }) {
    if (ci.quantity <= 1) return;
    if (this.auth.isLoggedIn()) {
      const apiItem = this.apiItems().find(a => a.item.id === ci.item.id);
      if (!apiItem) return;
      const userId = this.auth.getUserId()!;
      this.cartService.updateCartItem(apiItem.id, { itemId: ci.item.id, quantity: ci.quantity - 1 }, userId)
        .subscribe({ next: () => this.apiItems.update(items =>
            items.map(i => i.item.id === ci.item.id ? { ...i, quantity: i.quantity - 1 } : i)) });
    } else {
      this.cartService.updateGuestItemQty(ci.item.id, ci.quantity - 1);
    }
  }

  removeItem(ci: { item: any; quantity: number }) {
    if (this.auth.isLoggedIn()) {
      const apiItem = this.apiItems().find(a => a.item.id === ci.item.id);
      if (!apiItem) return;
      const userId = this.auth.getUserId()!;
      this.cartService.removeCartItem(apiItem.id, userId)
        .subscribe({ next: () => this.apiItems.update(items =>
            items.filter(i => i.item.id !== ci.item.id)) });
    } else {
      this.cartService.removeGuestItem(ci.item.id);
    }
  }

  // ── Payment flow ──────────────────────────────────────────────

  /** Step 1: Create a Stripe PaymentIntent and show the card form */
  proceedToPayment() {
    this.checkingOut.set(true);
    this.orderError.set('');

    const amountInCents = Math.round(this.getUnifiedTotal() * 100);

    this.http.post<{ clientSecret: string }>(
      `${environment.apiUrl}/payment/create-payment-intent`,
      { amount: amountInCents }
    ).subscribe({
      next: (res) => {
        this.clientSecret = res.clientSecret;
        this.checkingOut.set(false);
        this.showPaymentForm.set(true);
        // Wait for Angular to render the #stripe-card-element div
        setTimeout(() => this.mountStripeCard(), 150);
      },
      error: () => {
        this.checkingOut.set(false);
        this.orderError.set('Unable to initialize payment. Please try again.');
      }
    });
  }

  /** Mount the Stripe Card Element into #stripe-card-element */
  private mountStripeCard() {
    if (typeof Stripe === 'undefined') {
      this.orderError.set('Stripe.js failed to load. Please refresh the page.');
      return;
    }
    if (!this.stripe) {
      this.stripe = Stripe(environment.stripePublishableKey);
    }
    const elements = this.stripe.elements();
    this.cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '15px',
          fontFamily: '"Inter", "Helvetica Neue", Helvetica, sans-serif',
          color: '#374151',
          '::placeholder': { color: '#9CA3AF' },
        },
        invalid: { color: '#EF4444', iconColor: '#EF4444' }
      },
      hidePostalCode: true
    });
    this.cardElement.mount('#stripe-card-element');
  }

  /** Step 2: Confirm card payment, then place order on success */
  async payAndPlaceOrder() {
    if (!this.stripe || !this.cardElement) {
      this.orderError.set('Payment not initialized. Please refresh the page.');
      return;
    }
    this.checkingOut.set(true);
    this.orderError.set('');

    const { error, paymentIntent } = await this.stripe.confirmCardPayment(
      this.clientSecret,
      { payment_method: { card: this.cardElement } }
    );

    if (error) {
      this.checkingOut.set(false);
      this.orderError.set(error.message || 'Payment failed. Please check your card details and try again.');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      this.placeOrderAfterPayment();
    }
  }

  /** Step 3: Save the order in the database after payment is confirmed */
  private placeOrderAfterPayment() {
    if (this.auth.isLoggedIn()) {
      const userId = this.auth.getUserId()!;
      this.orderService.placeOrder({
        userId,
        item_id: this.apiItems().map(ci => ci.item.id),
        totalAmount: this.getUnifiedTotal()
      }).subscribe({
        next: () => {
          this.checkingOut.set(false);
          this.orderDone.set(true);
          this.apiItems.set([]);
          this.cartService.cart.set(null);
        },
        error: () => {
          this.checkingOut.set(false);
          this.orderError.set('Payment succeeded but order record failed. Please contact support.');
        }
      });
    } else {
      const deliveryAddress: DeliveryAddress = {
        street: this.guest.street,
        city: this.guest.city,
        state: this.guest.state,
        postalCode: this.guest.postalCode,
        country: this.guest.country
      };
      this.orderService.placeGuestOrder({
        guestName: this.guest.name,
        guestEmail: this.guest.email,
        item_id: this.cartService.guestItems().map(gi => gi.item.id),
        totalAmount: this.cartService.getGuestTotal(),
        deliveryAddress
      }).subscribe({
        next: () => {
          this.checkingOut.set(false);
          this.guestEmail.set(this.guest.email);
          this.cartService.clearGuestCart();
          this.orderDone.set(true);
        },
        error: () => {
          this.checkingOut.set(false);
          this.orderError.set('Payment succeeded but order record failed. Please contact support.');
        }
      });
    }
  }

  /** Cancel payment — go back to previous step */
  cancelPayment() {
    this.showPaymentForm.set(false);
    this.orderError.set('');
    this.clientSecret = '';
    this.cardElement = null;
  }
}
