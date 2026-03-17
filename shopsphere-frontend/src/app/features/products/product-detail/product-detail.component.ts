import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Item, Feedback, FeedbackRequest } from '../../../core/models';
import { getProductImage } from '../../../core/utils/product-images';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-container py-10">
      <!-- Breadcrumb -->
      <nav class="text-sm text-gray-500 mb-6">
        <a routerLink="/" class="hover:text-primary-600">Home</a>
        <span class="mx-2">›</span>
        <a routerLink="/products" class="hover:text-primary-600">Products</a>
        @if (product()) {
          <span class="mx-2">›</span>
          <span class="text-gray-700">{{ product()!.name }}</span>
        }
      </nav>

      @if (loading()) {
        <div class="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-12">
          <div class="aspect-square bg-gray-200 rounded-2xl"></div>
          <div class="space-y-4">
            <div class="h-8 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-full"></div>
            <div class="h-4 bg-gray-200 rounded w-full"></div>
            <div class="h-10 bg-gray-200 rounded w-1/3 mt-4"></div>
          </div>
        </div>
      } @else if (!product()) {
        <div class="text-center py-20">
          <p class="text-6xl mb-4">😕</p>
          <p class="text-xl font-semibold text-gray-700">Product not found</p>
          <a routerLink="/products" class="btn-primary mt-6 inline-block">Browse Products</a>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <!-- Image -->
          <div>
            <div class="aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img
                [src]="getImg(product()!)"
                [alt]="product()!.name"
                class="w-full h-full object-cover"
                (error)="onImgError($event)"
              />
            </div>
          </div>

          <!-- Info -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="badge badge-info">{{ product()!.category?.name }}</span>
              @if (product()!.quantity === 0) {
                <span class="badge badge-error">Out of Stock</span>
              } @else {
                <span class="badge badge-success">In Stock ({{ product()!.quantity }})</span>
              }
            </div>

            <h1 class="text-3xl font-bold text-gray-900 mb-3">{{ product()!.name }}</h1>

            @if (product()!.averageRating) {
              <div class="flex items-center gap-2 mb-4">
                <div class="star-rating">★★★★★</div>
                <span class="font-semibold text-gray-800">{{ product()!.averageRating | number:'1.1-1' }}</span>
                <span class="text-gray-400 text-sm">({{ product()!.totalFeedbacks }} reviews)</span>
              </div>
            }

            <p class="text-gray-600 leading-relaxed mb-6">{{ product()!.description }}</p>

            <div class="text-4xl font-extrabold text-gray-900 mb-6">
              \${{ product()!.price | number:'1.2-2' }}
            </div>

            <!-- Quantity -->
            @if (product()!.quantity > 0) {
              <div class="flex items-center gap-3 mb-6">
                <label class="text-sm font-medium text-gray-700">Qty:</label>
                <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button (click)="decQty()" [disabled]="qty <= 1" class="px-3 py-2 hover:bg-gray-50 border-r border-gray-300 text-lg font-bold disabled:opacity-40">−</button>
                  <span class="px-4 py-2 text-sm font-semibold min-w-[2.5rem] text-center">{{ qty }}</span>
                  <button (click)="incQty()" [disabled]="qty >= product()!.quantity" class="px-3 py-2 hover:bg-gray-50 border-l border-gray-300 text-lg font-bold disabled:opacity-40">+</button>
                </div>
              </div>
            }

            <!-- Actions -->
            <div class="flex gap-3">
              <button
                (click)="addToCart()"
                [disabled]="product()!.quantity === 0 || adding()"
                class="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ adding() ? 'Adding...' : '🛒 Add to Cart' }}
              </button>
              <a routerLink="/products" class="btn-secondary px-4">← Back</a>
            </div>

            @if (addedToCart()) {
              <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
                ✓ Added to your cart! <a routerLink="/cart" class="font-semibold underline">View Cart</a>
              </div>
            }
          </div>
        </div>

        <!-- Reviews Section -->
        <div class="mt-16 border-t border-gray-200 pt-10">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

          @if (auth.isLoggedIn()) {
            <div class="card p-6 mb-8">
              <h3 class="font-semibold text-gray-800 mb-4">Write a Review</h3>
              <div class="flex gap-2 mb-3">
                @for (star of [1,2,3,4,5]; track star) {
                  <button (click)="reviewRating = star"
                          [class]="star <= reviewRating ? 'text-yellow-400 text-2xl' : 'text-gray-300 text-2xl'">★</button>
                }
              </div>
              <textarea [(ngModel)]="reviewComment" rows="3"
                        placeholder="Share your experience with this product..."
                        class="input-field resize-none mb-3"></textarea>
              <button (click)="submitReview()" [disabled]="!reviewComment.trim() || reviewRating === 0 || submittingReview()"
                      class="btn-primary text-sm py-2">
                {{ submittingReview() ? 'Submitting...' : 'Submit Review' }}
              </button>
            </div>
          }

          @if (feedbackLoading()) {
            <div class="space-y-3">
              @for (i of [1,2,3]; track i) {
                <div class="animate-pulse card p-4">
                  <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div class="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              }
            </div>
          } @else if (feedbacks().length === 0) {
            <p class="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
          } @else {
            <div class="space-y-4">
              @for (fb of feedbacks(); track fb.id) {
                <div class="card p-5">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="star-rating text-sm">
                      @for (s of [1,2,3,4,5]; track s) {
                        <span [class]="s <= fb.rating ? 'text-yellow-400' : 'text-gray-200'">★</span>
                      }
                    </div>
                    <span class="text-xs text-gray-400">{{ fb.createdAt | date:'mediumDate' }}</span>
                  </div>
                  <p class="text-gray-700 text-sm">{{ fb.comment }}</p>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  public auth = inject(AuthService);
  private route = inject(ActivatedRoute);

  product = signal<Item | null>(null);
  feedbacks = signal<Feedback[]>([]);
  loading = signal(true);
  feedbackLoading = signal(true);
  adding = signal(false);
  addedToCart = signal(false);
  submittingReview = signal(false);

  qty = 1;
  reviewComment = '';
  reviewRating = 0;

  decQty() { if (this.qty > 1) this.qty--; }
  incQty() { const p = this.product(); if (p && this.qty < p.quantity) this.qty++; }
  getImg(product: Item): string { return getProductImage(product); }
  onImgError(event: Event) {
    (event.target as HTMLImageElement).src =
      'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=600&fit=crop&auto=format';
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getPublicProductById(id).subscribe({
      next: (p) => { this.product.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.productService.getFeedback(id).subscribe({
      next: (f) => { this.feedbacks.set(f); this.feedbackLoading.set(false); },
      error: () => this.feedbackLoading.set(false)
    });
  }

  addToCart() {
    const product = this.product();
    if (!product) return;

    if (this.auth.isLoggedIn()) {
      const userId = this.auth.getUserId();
      if (!userId) return;
      this.adding.set(true);
      this.cartService.addToCart(userId, { itemId: product.id, quantity: this.qty }).subscribe({
        next: () => {
          this.adding.set(false);
          this.addedToCart.set(true);
          setTimeout(() => this.addedToCart.set(false), 3000);
        },
        error: () => this.adding.set(false)
      });
    } else {
      // Guest: add to localStorage cart instantly (no API call needed)
      this.cartService.addGuestItem(product, this.qty);
      this.addedToCart.set(true);
      setTimeout(() => this.addedToCart.set(false), 3000);
    }
  }

  submitReview() {
    const userId = this.auth.getUserId();
    const product = this.product();
    if (!userId || !product || !this.reviewComment.trim() || this.reviewRating === 0) return;

    this.submittingReview.set(true);
    const req: FeedbackRequest = { comment: this.reviewComment, rating: this.reviewRating, userId };
    this.productService.addFeedback(product.id, req).subscribe({
      next: (fb) => {
        this.feedbacks.update(list => [fb, ...list]);
        this.reviewComment = '';
        this.reviewRating = 0;
        this.submittingReview.set(false);
      },
      error: () => this.submittingReview.set(false)
    });
  }
}
