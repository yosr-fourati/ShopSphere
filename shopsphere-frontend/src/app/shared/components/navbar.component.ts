import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div class="page-container">
        <div class="flex items-center justify-between h-16">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2 group">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 11H4L5 9z"/>
              </svg>
            </div>
            <span class="text-xl font-bold text-gray-900">Shop<span class="text-primary-600">Sphere</span></span>
          </a>

          <!-- Desktop Nav Links -->
          <div class="hidden md:flex items-center gap-6">
            <a routerLink="/" routerLinkActive="text-primary-600" [routerLinkActiveOptions]="{exact:true}"
               class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
              Home
            </a>
            <a routerLink="/products" routerLinkActive="text-primary-600"
               class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
              Products
            </a>
            @if (auth.isLoggedIn() && auth.getUserRole() === 'SELLER') {
              <a routerLink="/seller" routerLinkActive="text-primary-600"
                 class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
                Dashboard
              </a>
            }
            @if (auth.isLoggedIn() && auth.getUserRole() === 'ADMIN') {
              <a routerLink="/admin" routerLinkActive="text-primary-600"
                 class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
                Admin
              </a>
            }
          </div>

          <!-- Right side -->
          <div class="flex items-center gap-3">
            <!-- Cart (visible to everyone) -->
            <a routerLink="/cart" class="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              @if (cartService.cartCount() > 0) {
                <span class="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                  {{ cartService.cartCount() }}
                </span>
              }
            </a>

            @if (auth.isLoggedIn()) {
              <!-- Orders -->
              <a routerLink="/orders" class="hidden md:block text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
                Orders
              </a>

              <!-- User menu -->
              <div class="relative">
                <button (click)="menuOpen.set(!menuOpen())"
                        class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-semibold text-primary-700">
                      {{ auth.currentUser()?.email?.charAt(0)?.toUpperCase() }}
                    </span>
                  </div>
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                @if (menuOpen()) {
                  <div class="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div class="px-3 py-2 border-b border-gray-100">
                      <p class="text-xs text-gray-500 truncate">{{ auth.currentUser()?.email }}</p>
                      <span class="badge badge-info mt-0.5">{{ auth.getUserRole() }}</span>
                    </div>
                    <button (click)="logout()"
                            class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      Sign out
                    </button>
                  </div>
                }
              </div>
            } @else {
              <a routerLink="/auth/login"
                 class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
                Sign in
              </a>
              <a routerLink="/auth/register" class="btn-primary text-sm py-2 px-4">
                Sell on ShopSphere
              </a>
            }
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);
  cartService = inject(CartService);
  menuOpen = signal(false);

  logout() {
    this.menuOpen.set(false);
    this.auth.logout();
  }
}
