import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { Item, Order, ItemRequest } from '../../core/models';

type Tab = 'products' | 'orders' | 'add';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container py-10">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="section-title">Seller Dashboard</h1>
          <p class="text-gray-500 text-sm mt-1">Manage your products and orders</p>
        </div>
        <div class="badge badge-info">SELLER</div>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="card p-5">
          <p class="text-2xl font-bold text-gray-900">{{ products().length }}</p>
          <p class="text-xs text-gray-500 mt-0.5">Total Products</p>
        </div>
        <div class="card p-5">
          <p class="text-2xl font-bold text-gray-900">{{ orders().length }}</p>
          <p class="text-xs text-gray-500 mt-0.5">Total Orders</p>
        </div>
        <div class="card p-5">
          <p class="text-2xl font-bold text-gray-900">\${{ totalRevenue() | number:'1.0-0' }}</p>
          <p class="text-xs text-gray-500 mt-0.5">Revenue</p>
        </div>
        <div class="card p-5">
          <p class="text-2xl font-bold text-gray-900">{{ activeProducts() }}</p>
          <p class="text-xs text-gray-500 mt-0.5">In Stock</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 mb-6">
        <button (click)="activeTab.set('products')"
                [class]="activeTab() === 'products' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500 hover:text-gray-700'"
                class="px-6 py-3 text-sm transition-colors">
          My Products
        </button>
        <button (click)="activeTab.set('orders')"
                [class]="activeTab() === 'orders' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500 hover:text-gray-700'"
                class="px-6 py-3 text-sm transition-colors">
          Orders
        </button>
        <button (click)="openAddForm()"
                [class]="activeTab() === 'add' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500 hover:text-gray-700'"
                class="px-6 py-3 text-sm transition-colors">
          + Add Product
        </button>
      </div>

      <!-- Products Tab -->
      @if (activeTab() === 'products') {
        @if (loadingProducts()) {
          <div class="space-y-3">
            @for (i of [1,2,3]; track i) {
              <div class="card p-4 animate-pulse flex gap-4">
                <div class="w-16 h-16 bg-gray-200 rounded-xl"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            }
          </div>
        } @else if (products().length === 0) {
          <div class="text-center py-16 text-gray-400">
            <div class="text-5xl mb-4">📦</div>
            <p class="text-lg font-medium">No products yet</p>
            <button (click)="openAddForm()" class="btn-primary mt-4 text-sm">Add Your First Product</button>
          </div>
        } @else {
          <div class="space-y-3">
            @for (product of products(); track product.id) {
              <div class="card p-4 flex items-center gap-4">
                <div class="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span class="text-2xl">🛍️</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-900 truncate">{{ product.name }}</h3>
                  <div class="flex items-center gap-3 mt-0.5">
                    <span class="text-xs text-gray-400">{{ product.category?.name }}</span>
                    <span [class]="product.quantity > 0 ? 'badge-success' : 'badge-error'" class="badge">
                      {{ product.quantity > 0 ? product.quantity + ' in stock' : 'Out of stock' }}
                    </span>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <p class="font-bold text-gray-900">\${{ product.price | number:'1.2-2' }}</p>
                </div>
                <div class="flex gap-2 flex-shrink-0">
                  <button (click)="openEditForm(product)"
                          class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button (click)="deleteProduct(product.id)"
                          class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      }

      <!-- Orders Tab -->
      @if (activeTab() === 'orders') {
        @if (loadingOrders()) {
          <div class="space-y-3">
            @for (i of [1,2,3]; track i) {
              <div class="card p-5 animate-pulse">
                <div class="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div class="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            }
          </div>
        } @else if (orders().length === 0) {
          <div class="text-center py-16 text-gray-400">
            <div class="text-5xl mb-4">📋</div>
            <p class="text-lg font-medium">No orders yet</p>
          </div>
        } @else {
          <div class="space-y-3">
            @for (order of orders(); track order.id) {
              <div class="card p-5">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="flex items-center gap-3">
                      <h3 class="font-semibold text-gray-900">Order #{{ order.id }}</h3>
                      <span [class]="getStatusClass(order.status)" class="badge">{{ order.status }}</span>
                    </div>
                    <p class="text-xs text-gray-400 mt-0.5">{{ order.createdAt | date:'mediumDate' }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-gray-900">\${{ order.totalAmount | number:'1.2-2' }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      }

      <!-- Add/Edit Product Form -->
      @if (activeTab() === 'add') {
        <div class="max-w-lg">
          <div class="card p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-5">
              {{ editingProduct ? 'Edit Product' : 'Add New Product' }}
            </h2>

            <form (ngSubmit)="saveProduct()">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
                  <input [(ngModel)]="form.name" name="name" type="text" required
                         placeholder="e.g. Wireless Headphones" class="input-field"/>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                  <textarea [(ngModel)]="form.description" name="description" required rows="3"
                            placeholder="Describe your product..." class="input-field resize-none"></textarea>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Price (USD) *</label>
                    <input [(ngModel)]="form.price" name="price" type="number" required min="0.01" step="0.01"
                           placeholder="29.99" class="input-field"/>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Stock Quantity *</label>
                    <input [(ngModel)]="form.quantity" name="quantity" type="number" required min="0"
                           placeholder="100" class="input-field"/>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                  <select [(ngModel)]="form.category" name="category" required class="input-field">
                    <option value="">Select a category</option>
                    @for (cat of categories; track cat) {
                      <option [value]="cat">{{ cat }}</option>
                    }
                  </select>
                </div>
              </div>

              @if (formError()) {
                <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {{ formError() }}
                </div>
              }
              @if (formSuccess()) {
                <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  {{ formSuccess() }}
                </div>
              }

              <div class="flex gap-3 mt-6">
                <button type="submit" [disabled]="saving()"
                        class="btn-primary flex-1 disabled:opacity-50">
                  {{ saving() ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product') }}
                </button>
                <button type="button" (click)="cancelForm()" class="btn-secondary px-4">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class SellerDashboardComponent implements OnInit {
  private productService = inject(ProductService);
  private orderService = inject(OrderService);
  private auth = inject(AuthService);

  products = signal<Item[]>([]);
  orders = signal<Order[]>([]);
  activeTab = signal<Tab>('products');
  loadingProducts = signal(true);
  loadingOrders = signal(true);
  saving = signal(false);
  formError = signal('');
  formSuccess = signal('');

  editingProduct: Item | null = null;
  form: ItemRequest = { name: '', description: '', price: 0, quantity: 0, category: '' };

  categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Food', 'Other'];

  totalRevenue() {
    return this.orders().reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
  }

  activeProducts() {
    return this.products().filter(p => p.quantity > 0).length;
  }

  ngOnInit() {
    const userId = this.auth.getUserId();
    if (!userId) return;

    this.productService.getSellerProducts(userId).subscribe({
      next: (p) => { this.products.set(p); this.loadingProducts.set(false); },
      error: () => this.loadingProducts.set(false)
    });

    this.orderService.getAllOrders().subscribe({
      next: (o) => { this.orders.set(o); this.loadingOrders.set(false); },
      error: () => this.loadingOrders.set(false)
    });
  }

  openAddForm() {
    this.editingProduct = null;
    this.form = { name: '', description: '', price: 0, quantity: 0, category: '' };
    this.formError.set('');
    this.formSuccess.set('');
    this.activeTab.set('add');
  }

  openEditForm(product: Item) {
    this.editingProduct = product;
    this.form = {
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      category: product.category?.name ?? '',
    };
    this.formError.set('');
    this.formSuccess.set('');
    this.activeTab.set('add');
  }

  saveProduct() {
    const userId = this.auth.getUserId();
    if (!userId) return;

    if (!this.form.name || !this.form.description || !this.form.price || !this.form.category) {
      this.formError.set('Please fill in all required fields.');
      return;
    }

    this.saving.set(true);
    this.formError.set('');

    const obs = this.editingProduct
      ? this.productService.updateProduct(this.editingProduct.id, this.form)
      : this.productService.createProduct(userId, this.form);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.formSuccess.set(this.editingProduct ? 'Product updated!' : 'Product added successfully!');
        // Refresh products list
        this.productService.getSellerProducts(userId).subscribe(p => this.products.set(p));
        setTimeout(() => {
          this.activeTab.set('products');
          this.formSuccess.set('');
        }, 1500);
      },
      error: () => {
        this.saving.set(false);
        this.formError.set('Failed to save product. Please try again.');
      }
    });
  }

  deleteProduct(id: number) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => this.products.update(list => list.filter(p => p.id !== id)),
      error: () => {}
    });
  }

  cancelForm() {
    this.activeTab.set('products');
    this.editingProduct = null;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING:   'badge-warning',
      CONFIRMED: 'badge-info',
      SHIPPED:   'badge-info',
      DELIVERED: 'badge-success',
      CANCELLED: 'badge-error',
    };
    return map[status] ?? 'badge badge-info';
  }
}
