import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Item, Page } from '../../../core/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container py-10">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="section-title mb-2">All Products</h1>
        <p class="text-gray-500 text-sm">{{ page()?.totalElements ?? 0 }} products available</p>
      </div>

      <!-- Search & Filter bar -->
      <div class="flex flex-col sm:flex-row gap-3 mb-8">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            [(ngModel)]="searchQuery"
            (keyup.enter)="onSearch()"
            type="text"
            placeholder="Search products..."
            class="input-field pl-10"
          />
        </div>
        <button (click)="onSearch()" class="btn-primary py-2.5">Search</button>
        @if (searchQuery) {
          <button (click)="clearSearch()" class="btn-secondary py-2.5">Clear</button>
        }
      </div>

      <!-- Product Grid -->
      @if (loading()) {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          @for (i of [1,2,3,4,5,6,7,8,9,10,11,12]; track i) {
            <div class="card animate-pulse">
              <div class="w-full h-52 bg-gray-200"></div>
              <div class="p-4 space-y-2">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded w-full"></div>
                <div class="h-5 bg-gray-200 rounded w-1/3 mt-3"></div>
              </div>
            </div>
          }
        </div>
      } @else if (products().length === 0) {
        <div class="text-center py-20 text-gray-400">
          <p class="text-6xl mb-4">🔍</p>
          <p class="text-xl font-semibold">No products found</p>
          <p class="text-sm mt-2">Try a different search term</p>
          <button (click)="clearSearch()" class="btn-primary mt-6 text-sm">Browse All Products</button>
        </div>
      } @else {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          @for (product of products(); track product.id) {
            <div class="card-hover flex flex-col">
              <!-- Image -->
              <a [routerLink]="['/products', product.id]" class="block">
                <div class="w-full h-52 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden group">
                  <span class="text-5xl group-hover:scale-110 transition-transform duration-200">🛍️</span>
                  @if (product.quantity === 0) {
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span class="badge bg-red-500 text-white text-xs font-medium px-3 py-1">Out of Stock</span>
                    </div>
                  }
                  <div class="absolute top-2 left-2">
                    <span class="badge badge-info text-xs">{{ product.category?.name }}</span>
                  </div>
                </div>
              </a>

              <div class="p-4 flex flex-col flex-1">
                <a [routerLink]="['/products', product.id]">
                  <h3 class="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-primary-600 transition-colors">
                    {{ product.name }}
                  </h3>
                </a>
                <p class="text-xs text-gray-400 line-clamp-2 mt-1 flex-1">{{ product.description }}</p>

                @if (product.averageRating) {
                  <div class="flex items-center gap-1 mt-2">
                    <span class="star-rating text-xs">★</span>
                    <span class="text-xs text-gray-600 font-medium">{{ product.averageRating | number:'1.1-1' }}</span>
                    <span class="text-xs text-gray-400">({{ product.totalFeedbacks }})</span>
                  </div>
                }

                <div class="flex items-center justify-between mt-3">
                  <span class="text-lg font-bold text-gray-900">\${{ product.price | number:'1.2-2' }}</span>
                  @if (product.quantity > 0 && auth.isLoggedIn()) {
                    <button (click)="addToCart(product)" [disabled]="addingToCart === product.id"
                            class="btn-primary text-xs py-1.5 px-3">
                      @if (addingToCart === product.id) {
                        <span>Adding...</span>
                      } @else {
                        <span>Add to Cart</span>
                      }
                    </button>
                  } @else if (!auth.isLoggedIn()) {
                    <a routerLink="/auth/login" class="btn-secondary text-xs py-1.5 px-3">Sign In</a>
                  }
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (page() && page()!.totalPages > 1) {
          <div class="flex items-center justify-center gap-2 mt-10">
            <button
              [disabled]="currentPage() === 0"
              (click)="goToPage(currentPage() - 1)"
              class="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              ← Prev
            </button>

            @for (p of getPages(); track p) {
              <button
                (click)="goToPage(p)"
                [class]="p === currentPage() ? 'px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium' : 'px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors'">
                {{ p + 1 }}
              </button>
            }

            <button
              [disabled]="page()!.last"
              (click)="goToPage(currentPage() + 1)"
              class="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next →
            </button>
          </div>
        }
      }
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  public auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  products = signal<Item[]>([]);
  page = signal<Page<Item> | null>(null);
  loading = signal(true);
  currentPage = signal(0);
  searchQuery = '';
  addingToCart: number | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] ?? '';
      this.currentPage.set(0);
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loading.set(true);
    const obs = this.searchQuery
      ? this.productService.searchPublicProducts(this.searchQuery, this.currentPage(), 20)
      : this.productService.getPublicProducts(this.currentPage(), 20);

    obs.subscribe({
      next: (p) => {
        this.page.set(p);
        this.products.set(p.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch() {
    this.router.navigate([], { queryParams: this.searchQuery ? { q: this.searchQuery } : {} });
  }

  clearSearch() {
    this.searchQuery = '';
    this.router.navigate([], { queryParams: {} });
  }

  goToPage(p: number) {
    this.currentPage.set(p);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPages(): number[] {
    const total = this.page()?.totalPages ?? 0;
    const current = this.currentPage();
    const start = Math.max(0, current - 2);
    const end = Math.min(total - 1, current + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  addToCart(product: Item) {
    const userId = this.auth.getUserId();
    if (!userId) return;
    this.addingToCart = product.id;
    this.cartService.addToCart(userId, { itemId: product.id, quantity: 1 }).subscribe({
      next: () => { this.addingToCart = null; },
      error: () => { this.addingToCart = null; }
    });
  }
}
