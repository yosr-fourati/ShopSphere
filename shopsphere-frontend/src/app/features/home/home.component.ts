import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Item } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div class="absolute bottom-10 right-10 w-96 h-96 bg-accent-500 rounded-full blur-3xl"></div>
      </div>

      <div class="page-container relative py-24 md:py-32">
        <div class="max-w-2xl animate-fade-in">
          <div class="badge bg-primary-500/30 text-primary-200 border border-primary-500/40 mb-6">
            🌍 Global Multi-Seller Marketplace
          </div>
          <h1 class="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Discover Products
            <span class="text-accent-400"> From Around</span>
            <br>the World
          </h1>
          <p class="text-lg text-primary-200 mb-8 max-w-lg">
            Shop from thousands of verified sellers. Secure payments powered by Stripe. Fast delivery worldwide.
          </p>

          <!-- Search bar -->
          <div class="flex gap-2 max-w-lg">
            <input
              [(ngModel)]="searchQuery"
              (keyup.enter)="onSearch()"
              type="text"
              placeholder="Search products..."
              class="flex-1 px-5 py-3.5 rounded-xl text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm"
            />
            <button (click)="onSearch()" class="px-6 py-3.5 bg-accent-500 hover:bg-accent-600 rounded-xl font-semibold transition-colors shadow-lg text-sm whitespace-nowrap">
              Search
            </button>
          </div>
        </div>

        <!-- Stats row -->
        <div class="grid grid-cols-3 gap-6 mt-16 max-w-lg">
          @for (stat of stats; track stat.label) {
            <div class="text-center">
              <p class="text-3xl font-bold text-white">{{ stat.value }}</p>
              <p class="text-xs text-primary-300 mt-0.5">{{ stat.label }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="bg-white py-14 border-b border-gray-100">
      <div class="page-container">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (feature of features; track feature.title) {
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span class="text-xl">{{ feature.icon }}</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">{{ feature.title }}</h3>
                <p class="text-sm text-gray-500">{{ feature.desc }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-16">
      <div class="page-container">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="section-title">Featured Products</h2>
            <p class="text-gray-500 text-sm mt-1">Hand-picked products from top sellers</p>
          </div>
          <a routerLink="/products" class="btn-secondary text-sm py-2">View All →</a>
        </div>

        @if (loading()) {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="card animate-pulse">
                <div class="w-full h-48 bg-gray-200"></div>
                <div class="p-4 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div class="h-5 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            }
          </div>
        } @else if (products().length === 0) {
          <div class="text-center py-16 text-gray-400">
            <p class="text-5xl mb-4">📦</p>
            <p class="text-lg font-medium">No products yet</p>
            <p class="text-sm mt-1">Check back soon!</p>
          </div>
        } @else {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            @for (product of products(); track product.id) {
              <a [routerLink]="['/products', product.id]" class="card-hover group block">
                <!-- Product image placeholder -->
                <div class="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                  <span class="text-5xl">🛍️</span>
                  @if (product.quantity === 0) {
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span class="badge bg-red-500 text-white">Out of Stock</span>
                    </div>
                  }
                </div>
                <div class="p-4">
                  <p class="text-xs text-primary-600 font-medium mb-1">{{ product.category?.name }}</p>
                  <h3 class="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {{ product.name }}
                  </h3>
                  @if (product.averageRating) {
                    <div class="flex items-center gap-1 mt-1">
                      <span class="star-rating text-xs">★★★★★</span>
                      <span class="text-xs text-gray-500">{{ product.averageRating | number:'1.1-1' }}</span>
                    </div>
                  }
                  <div class="flex items-center justify-between mt-3">
                    <span class="text-lg font-bold text-gray-900">\${{ product.price | number:'1.2-2' }}</span>
                    <span class="text-xs text-gray-400">{{ product.quantity }} left</span>
                  </div>
                </div>
              </a>
            }
          </div>
        }
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-primary-600 py-16 text-white">
      <div class="page-container text-center">
        <h2 class="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
        <p class="text-primary-200 mb-8 max-w-md mx-auto">
          Join thousands of sellers worldwide. Register as a seller and start listing your products today.
        </p>
        <a routerLink="/auth/register" class="inline-block bg-white text-primary-700 font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors">
          Become a Seller
        </a>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  products = signal<Item[]>([]);
  loading = signal(true);
  searchQuery = '';

  stats = [
    { value: '10K+', label: 'Products' },
    { value: '500+', label: 'Sellers' },
    { value: '50K+', label: 'Customers' },
  ];

  features = [
    { icon: '🔒', title: 'Secure Payments', desc: 'All transactions protected by Stripe with 256-bit encryption.' },
    { icon: '🚚', title: 'Fast Delivery', desc: 'Sellers ship directly to you. Track every order in real time.' },
    { icon: '⭐', title: 'Verified Reviews', desc: 'Honest feedback from real buyers on every product.' },
  ];

  ngOnInit() {
    this.productService.getPublicProducts(0, 8).subscribe({
      next: (page) => {
        this.products.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { q: this.searchQuery.trim() } });
    } else {
      this.router.navigate(['/products']);
    }
  }
}
