import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Item, Page, Category } from '../../../core/models';
import { getProductImage } from '../../../core/utils/product-images';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container py-10">

      <!-- Header -->
      <div class="mb-6">
        <h1 class="section-title mb-1">All Products</h1>
        <p class="text-gray-500 text-sm">{{ page()?.totalElements ?? 0 }} products found</p>
      </div>

      <!-- Search bar -->
      <div class="flex flex-col sm:flex-row gap-3 mb-8">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" type="text"
            placeholder="Search products..." class="input-field pl-10"/>
        </div>
        <button (click)="onSearch()" class="btn-primary py-2.5 px-6">Search</button>
        <!-- Mobile filter toggle -->
        <button (click)="filtersOpen.set(!filtersOpen())"
          class="sm:hidden flex items-center gap-2 btn-secondary py-2.5 px-4">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
          </svg>
          Filters {{ hasActiveFilters ? '●' : '' }}
        </button>
      </div>

      <div class="flex gap-8">

        <!-- ── Filter Sidebar ────────────────────────────── -->
        <aside class="hidden sm:block w-56 flex-shrink-0">
          <div class="sticky top-24 space-y-6">

            <!-- Active filters badge -->
            @if (hasActiveFilters) {
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-primary-600 uppercase tracking-wider">Active Filters</span>
                <button (click)="clearFilters()" class="text-xs text-red-500 hover:text-red-700 font-medium">Clear all</button>
              </div>
            }

            <!-- Categories -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Category</h3>
              <ul class="space-y-1.5">
                <li>
                  <button (click)="selectCategory(null)"
                    [class]="selectedCategoryId() === null
                      ? 'w-full text-left px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 font-medium text-sm'
                      : 'w-full text-left px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition-colors'">
                    All Categories
                  </button>
                </li>
                @for (cat of categories(); track cat.id) {
                  <li>
                    <button (click)="selectCategory(cat.id)"
                      [class]="selectedCategoryId() === cat.id
                        ? 'w-full text-left px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 font-medium text-sm'
                        : 'w-full text-left px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition-colors'">
                      {{ cat.name }}
                    </button>
                  </li>
                }
              </ul>
            </div>

            <!-- Price Range -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
              <div class="flex gap-2 items-center">
                <input [(ngModel)]="minPrice" (change)="applyPriceFilter()" type="number" min="0"
                  placeholder="Min" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                <span class="text-gray-400 text-xs">–</span>
                <input [(ngModel)]="maxPrice" (change)="applyPriceFilter()" type="number" min="0"
                  placeholder="Max" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
            </div>

            <!-- Sort -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Sort By</h3>
              <div class="space-y-1.5">
                @for (opt of sortOptions; track opt.value) {
                  <button (click)="setSort(opt.sortBy, opt.sortDir)"
                    [class]="sortBy() === opt.sortBy && sortDir() === opt.sortDir
                      ? 'w-full text-left px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 font-medium text-sm'
                      : 'w-full text-left px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition-colors'">
                    {{ opt.label }}
                  </button>
                }
              </div>
            </div>

          </div>
        </aside>

        <!-- ── Mobile Filter Panel ──────────────────────── -->
        @if (filtersOpen()) {
          <div class="sm:hidden fixed inset-0 z-40 flex">
            <div class="absolute inset-0 bg-black/40" (click)="filtersOpen.set(false)"></div>
            <div class="relative ml-auto w-72 bg-white h-full overflow-y-auto p-6 shadow-xl">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-bold">Filters</h2>
                <button (click)="filtersOpen.set(false)" class="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              @if (hasActiveFilters) {
                <button (click)="clearFilters(); filtersOpen.set(false)" class="w-full mb-4 text-sm text-red-500 hover:text-red-700 font-medium text-left">Clear all filters</button>
              }

              <div class="mb-6">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">Category</h3>
                <ul class="space-y-1">
                  <li><button (click)="selectCategory(null); filtersOpen.set(false)"
                    [class]="selectedCategoryId() === null ? 'w-full text-left px-3 py-2 rounded-lg bg-primary-50 text-primary-700 font-medium text-sm' : 'w-full text-left px-3 py-2 rounded-lg text-gray-600 text-sm'">All Categories</button></li>
                  @for (cat of categories(); track cat.id) {
                    <li><button (click)="selectCategory(cat.id); filtersOpen.set(false)"
                      [class]="selectedCategoryId() === cat.id ? 'w-full text-left px-3 py-2 rounded-lg bg-primary-50 text-primary-700 font-medium text-sm' : 'w-full text-left px-3 py-2 rounded-lg text-gray-600 text-sm'">{{ cat.name }}</button></li>
                  }
                </ul>
              </div>

              <div class="mb-6">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
                <div class="flex gap-2 items-center">
                  <input [(ngModel)]="minPrice" type="number" min="0" placeholder="Min"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                  <span class="text-gray-400">–</span>
                  <input [(ngModel)]="maxPrice" type="number" min="0" placeholder="Max"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                </div>
              </div>

              <button (click)="applyPriceFilter(); filtersOpen.set(false)" class="btn-primary w-full">Apply Filters</button>

              <div class="mt-6">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">Sort By</h3>
                @for (opt of sortOptions; track opt.value) {
                  <button (click)="setSort(opt.sortBy, opt.sortDir); filtersOpen.set(false)"
                    [class]="sortBy() === opt.sortBy && sortDir() === opt.sortDir ? 'w-full text-left px-3 py-2 rounded-lg bg-primary-50 text-primary-700 font-medium text-sm mb-1' : 'w-full text-left px-3 py-2 rounded-lg text-gray-600 text-sm mb-1'">
                    {{ opt.label }}
                  </button>
                }
              </div>
            </div>
          </div>
        }

        <!-- ── Product Grid ─────────────────────────────── -->
        <div class="flex-1 min-w-0">

          @if (loading()) {
            <div class="grid grid-cols-2 md:grid-cols-3 gap-5">
              @for (i of [1,2,3,4,5,6,7,8,9]; track i) {
                <div class="card animate-pulse">
                  <div class="w-full h-48 bg-gray-200"></div>
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
              <p class="text-sm mt-2">Try different filters or search terms</p>
              <button (click)="clearFilters()" class="btn-primary mt-6 text-sm">Reset Filters</button>
            </div>
          } @else {
            <div class="grid grid-cols-2 md:grid-cols-3 gap-5">
              @for (product of products(); track product.id) {
                <div class="card-hover flex flex-col">
                  <!-- Image -->
                  <a [routerLink]="['/products', product.id]" class="block overflow-hidden">
                    <div class="relative w-full h-48 bg-gray-100 overflow-hidden">
                      <img
                        [src]="getImg(product)"
                        [alt]="product.name"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        (error)="onImgError($event)"
                      />
                      @if (product.quantity === 0) {
                        <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span class="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
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
                        <span class="text-yellow-400 text-xs">★</span>
                        <span class="text-xs text-gray-600 font-medium">{{ product.averageRating | number:'1.1-1' }}</span>
                        <span class="text-xs text-gray-400">({{ product.totalFeedbacks }})</span>
                      </div>
                    }

                    <div class="flex items-center justify-between mt-3">
                      <span class="text-lg font-bold text-gray-900">\${{ product.price | number:'1.2-2' }}</span>
                      @if (product.quantity > 0 && auth.isLoggedIn()) {
                        <button (click)="addToCart(product)" [disabled]="addingToCart === product.id"
                          class="btn-primary text-xs py-1.5 px-3">
                          {{ addingToCart === product.id ? 'Adding...' : 'Add to Cart' }}
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
                <button [disabled]="currentPage() === 0" (click)="goToPage(currentPage() - 1)"
                  class="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  ← Prev
                </button>
                @for (p of getPages(); track p) {
                  <button (click)="goToPage(p)"
                    [class]="p === currentPage()
                      ? 'px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium'
                      : 'px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors'">
                    {{ p + 1 }}
                  </button>
                }
                <button [disabled]="page()!.last" (click)="goToPage(currentPage() + 1)"
                  class="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Next →
                </button>
              </div>
            }
          }

        </div>
      </div>
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
  categories = signal<Category[]>([]);
  loading = signal(true);
  currentPage = signal(0);
  filtersOpen = signal(false);

  searchQuery = '';
  selectedCategoryId = signal<number | null>(null);
  minPrice = '';
  maxPrice = '';
  sortBy = signal('id');
  sortDir = signal<'asc' | 'desc'>('asc');
  addingToCart: number | null = null;

  sortOptions = [
    { value: 'id-asc',     label: 'Newest',        sortBy: 'id',    sortDir: 'desc' as const },
    { value: 'price-asc',  label: 'Price: Low → High', sortBy: 'price', sortDir: 'asc'  as const },
    { value: 'price-desc', label: 'Price: High → Low', sortBy: 'price', sortDir: 'desc' as const },
    { value: 'name-asc',   label: 'Name: A → Z',   sortBy: 'name',  sortDir: 'asc'  as const },
  ];

  ngOnInit() {
    this.productService.getPublicCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => {}
    });
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] ?? '';
      const cat = params['category'];
      this.selectedCategoryId.set(cat ? +cat : null);
      this.currentPage.set(0);
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getPublicProducts(
      this.currentPage(), 20,
      this.searchQuery || null,
      this.selectedCategoryId(),
      this.minPrice ? +this.minPrice : null,
      this.maxPrice ? +this.maxPrice : null,
      this.sortBy(),
      this.sortDir()
    ).subscribe({
      next: (p) => { this.page.set(p); this.products.set(p.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSearch() { this.currentPage.set(0); this.loadProducts(); }

  selectCategory(id: number | null) {
    this.selectedCategoryId.set(id);
    this.currentPage.set(0);
    this.loadProducts();
  }

  applyPriceFilter() { this.currentPage.set(0); this.loadProducts(); }

  setSort(by: string, dir: 'asc' | 'desc') {
    this.sortBy.set(by);
    this.sortDir.set(dir);
    this.currentPage.set(0);
    this.loadProducts();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategoryId.set(null);
    this.minPrice = '';
    this.maxPrice = '';
    this.sortBy.set('id');
    this.sortDir.set('asc');
    this.currentPage.set(0);
    this.loadProducts();
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

  getImg(product: Item): string { return getProductImage(product); }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src =
      'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=280&fit=crop&auto=format';
  }

  get hasActiveFilters(): boolean {
    return !!this.searchQuery || this.selectedCategoryId() !== null || !!this.minPrice || !!this.maxPrice;
  }
}
