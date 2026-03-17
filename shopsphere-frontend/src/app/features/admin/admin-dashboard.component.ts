import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, SystemStats, AdminOrder, AdminItem } from '../../core/services/admin.service';
import { User } from '../../core/models';

type Tab = 'overview' | 'orders' | 'products' | 'sellers' | 'users';

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPED:   'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container py-10">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="section-title">Admin Dashboard</h1>
          <p class="text-gray-500 text-sm mt-1">Manage your platform — users, orders, products, and sellers</p>
        </div>
        <span class="px-3 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full uppercase tracking-wide">ADMIN</span>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        @if (stats()) {
          <div class="card p-5 border-l-4 border-primary-500">
            <p class="text-2xl font-bold text-gray-900">{{ stats()!.totalUsers }}</p>
            <p class="text-xs text-gray-500 mt-0.5">Total Users</p>
          </div>
          <div class="card p-5 border-l-4 border-green-500">
            <p class="text-2xl font-bold text-gray-900">{{ stats()!.totalOrders }}</p>
            <p class="text-xs text-gray-500 mt-0.5">Total Orders</p>
          </div>
          <div class="card p-5 border-l-4 border-blue-500">
            <p class="text-2xl font-bold text-gray-900">\${{ (stats()!.totalSales || 0) | number:'1.0-0' }}</p>
            <p class="text-xs text-gray-500 mt-0.5">Total Revenue</p>
          </div>
          <div class="card p-5 border-l-4 border-amber-500 relative">
            <p class="text-2xl font-bold text-gray-900">{{ pendingSellers().length }}</p>
            <p class="text-xs text-gray-500 mt-0.5">Pending Sellers</p>
            @if (pendingSellers().length > 0) {
              <span class="absolute top-3 right-3 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {{ pendingSellers().length }}
              </span>
            }
          </div>
        } @else {
          @for (i of [1,2,3,4]; track i) {
            <div class="card p-5 animate-pulse">
              <div class="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          }
        }
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 mb-6 overflow-x-auto">
        @for (tab of tabs; track tab.id) {
          <button (click)="activeTab.set(tab.id)"
                  [class]="activeTab() === tab.id
                    ? 'border-b-2 border-primary-600 text-primary-600 font-semibold'
                    : 'text-gray-500 hover:text-gray-700'"
                  class="px-5 py-3 text-sm transition-colors whitespace-nowrap flex items-center gap-1.5">
            {{ tab.label }}
            @if (tab.id === 'sellers' && pendingSellers().length > 0) {
              <span class="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{{ pendingSellers().length }}</span>
            }
          </button>
        }
      </div>

      <!-- ── OVERVIEW TAB ── -->
      @if (activeTab() === 'overview') {
        <div class="grid md:grid-cols-2 gap-6">
          @if (stats()) {
            <div class="card p-6">
              <h2 class="font-bold text-gray-900 mb-4">Order Status Breakdown</h2>
              <div class="space-y-3">
                @for (entry of getOrderStatusEntries(); track entry[0]) {
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">{{ entry[0] }}</span>
                    <span class="px-2.5 py-0.5 text-xs font-medium rounded-full" [class]="getStatusColorClass(entry[0])">
                      {{ entry[1] }}
                    </span>
                  </div>
                }
                @if (getOrderStatusEntries().length === 0) {
                  <p class="text-sm text-gray-400">No orders yet</p>
                }
              </div>
            </div>
            <div class="card p-6">
              <h2 class="font-bold text-gray-900 mb-4">Platform Health</h2>
              <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-600">Active users (30d)</span>
                  <span class="font-semibold text-gray-900">{{ stats()!.activeUsers }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-600">New users (7d)</span>
                  <span class="font-semibold text-green-600">+{{ stats()!.newUsers }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-600">Avg. order value</span>
                  <span class="font-semibold text-gray-900">\${{ stats()!.averageOrderValue | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between items-center py-2">
                  <span class="text-sm text-gray-600">Avg. product rating</span>
                  <span class="font-semibold text-gray-900">{{ stats()!.averageRating | number:'1.1-1' }} / 5 ⭐</span>
                </div>
              </div>
            </div>
          } @else {
            <div class="card p-8 col-span-2 text-center text-gray-400">Loading stats...</div>
          }
        </div>
      }

      <!-- ── ORDERS TAB ── -->
      @if (activeTab() === 'orders') {
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-gray-800">All Orders <span class="text-gray-400 font-normal text-sm">({{ orders().length }})</span></h2>
            <button (click)="loadOrders()" class="text-sm text-primary-600 hover:underline">↻ Refresh</button>
          </div>
          @if (loadingOrders()) {
            <div class="space-y-3">
              @for (i of [1,2,3,4,5]; track i) {
                <div class="card p-4 animate-pulse flex gap-4">
                  <div class="h-4 bg-gray-200 rounded w-16"></div>
                  <div class="h-4 bg-gray-200 rounded flex-1"></div>
                  <div class="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              }
            </div>
          } @else if (orders().length === 0) {
            <div class="text-center py-16 text-gray-400">
              <div class="text-5xl mb-4">📦</div>
              <p class="text-lg font-medium">No orders yet</p>
            </div>
          } @else {
            <div class="card overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-gray-50 border-b border-gray-200">
                      <th class="text-left px-4 py-3 font-semibold text-gray-600 w-16">#ID</th>
                      <th class="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                      <th class="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                      <th class="text-right px-4 py-3 font-semibold text-gray-600">Amount</th>
                      <th class="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                      <th class="text-left px-4 py-3 font-semibold text-gray-600 w-36">Update</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    @for (order of orders(); track order.id) {
                      <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-4 py-3 text-gray-500 font-mono">#{{ order.id }}</td>
                        <td class="px-4 py-3">
                          @if (order.userEmail) {
                            <span class="font-medium text-gray-900">{{ order.userName || order.userEmail }}</span>
                            <p class="text-xs text-gray-400">{{ order.userEmail }}</p>
                          } @else if (order.guestEmail) {
                            <span class="font-medium text-gray-900">{{ order.guestName || 'Guest' }}</span>
                            <p class="text-xs text-gray-400">{{ order.guestEmail }}</p>
                          } @else {
                            <span class="text-gray-400 italic">Unknown</span>
                          }
                        </td>
                        <td class="px-4 py-3 text-gray-500 text-xs">
                          {{ order.orderDate ? (order.orderDate | date:'MMM d, y') : '—' }}
                        </td>
                        <td class="px-4 py-3 text-right font-semibold text-gray-900">
                          \${{ order.totalAmount | number:'1.2-2' }}
                        </td>
                        <td class="px-4 py-3">
                          <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full" [class]="getStatusColorClass(order.status)">
                            {{ order.status }}
                          </span>
                        </td>
                        <td class="px-4 py-3">
                          <select [(ngModel)]="order.status"
                                  (change)="updateOrderStatus(order)"
                                  class="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                            @for (s of orderStatuses; track s) {
                              <option [value]="s">{{ s }}</option>
                            }
                          </select>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      }

      <!-- ── PRODUCTS TAB ── -->
      @if (activeTab() === 'products') {
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-gray-800">All Products <span class="text-gray-400 font-normal text-sm">({{ items().length }})</span></h2>
            <button (click)="loadItems()" class="text-sm text-primary-600 hover:underline">↻ Refresh</button>
          </div>
          @if (loadingItems()) {
            <div class="space-y-3">
              @for (i of [1,2,3,4,5]; track i) {
                <div class="card p-4 animate-pulse flex gap-4">
                  <div class="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div class="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              }
            </div>
          } @else if (items().length === 0) {
            <div class="text-center py-16 text-gray-400">
              <div class="text-5xl mb-4">🛍️</div>
              <p class="text-lg font-medium">No products found</p>
            </div>
          } @else {
            <div class="card overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-gray-50 border-b border-gray-200">
                      <th class="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                      <th class="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                      <th class="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                      <th class="text-right px-4 py-3 font-semibold text-gray-600">Price</th>
                      <th class="text-right px-4 py-3 font-semibold text-gray-600">Stock</th>
                      <th class="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    @for (item of items(); track item.id) {
                      <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-4 py-3 text-gray-400 font-mono text-xs">{{ item.id }}</td>
                        <td class="px-4 py-3">
                          <p class="font-medium text-gray-900">{{ item.name }}</p>
                          <p class="text-xs text-gray-400 truncate max-w-xs">{{ item.description }}</p>
                        </td>
                        <td class="px-4 py-3">
                          <span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{{ item.category?.name }}</span>
                        </td>
                        <td class="px-4 py-3 text-right font-semibold text-gray-900">\${{ item.price | number:'1.2-2' }}</td>
                        <td class="px-4 py-3 text-right">
                          <span [class]="item.quantity > 5 ? 'text-green-600' : item.quantity > 0 ? 'text-amber-600' : 'text-red-500'"
                                class="font-medium">{{ item.quantity }}</span>
                        </td>
                        <td class="px-4 py-3 text-right">
                          <button (click)="deleteItem(item.id)"
                                  [disabled]="processing() === item.id"
                                  class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                                  title="Delete product">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      }

      <!-- ── SELLERS TAB ── -->
      @if (activeTab() === 'sellers') {
        <div>
          <h2 class="font-semibold text-gray-800 mb-4">Pending Seller Applications</h2>
          @if (loadingSellers()) {
            <div class="space-y-3">
              @for (i of [1,2,3]; track i) {
                <div class="card p-5 animate-pulse flex gap-4">
                  <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              }
            </div>
          } @else if (pendingSellers().length === 0) {
            <div class="text-center py-16 text-gray-400">
              <div class="text-5xl mb-4">✅</div>
              <p class="text-lg font-medium">No pending applications</p>
              <p class="text-sm mt-1">All seller applications have been processed.</p>
            </div>
          } @else {
            <div class="space-y-3">
              @for (seller of pendingSellers(); track seller.id) {
                <div class="card p-5 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <span class="text-lg font-bold text-amber-700">{{ seller.firstname?.charAt(0) }}</span>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900">{{ seller.firstname }} {{ seller.lastname }}</p>
                      <p class="text-sm text-gray-500">{{ seller.email }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
                    <button (click)="approveSeller(seller.id)"
                            [disabled]="processing() === seller.id"
                            class="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                      {{ processing() === seller.id ? '...' : '✓ Approve' }}
                    </button>
                    <button (click)="rejectSeller(seller.id)"
                            [disabled]="processing() === seller.id"
                            class="px-4 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors">
                      ✕ Reject
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- ── USERS TAB ── -->
      @if (activeTab() === 'users') {
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-gray-800">All Users <span class="text-gray-400 font-normal text-sm">({{ users().length }})</span></h2>
            <button (click)="loadUsers()" class="text-sm text-primary-600 hover:underline">↻ Refresh</button>
          </div>
          @if (loadingUsers()) {
            <div class="space-y-3">
              @for (i of [1,2,3,4,5]; track i) {
                <div class="card p-4 animate-pulse flex gap-3">
                  <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div class="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="card overflow-hidden">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-200">
                    <th class="text-left px-4 py-3 font-semibold text-gray-600">User</th>
                    <th class="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                    <th class="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                    <th class="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th class="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (user of users(); track user.id) {
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                               [class]="getRoleName(user) === 'ADMIN' ? 'bg-red-100 text-red-700' : getRoleName(user) === 'SELLER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'">
                            {{ user.firstname?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() }}
                          </div>
                          <span class="font-medium text-gray-900">{{ user.firstname }} {{ user.lastname }}</span>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-gray-500 text-xs">{{ user.email }}</td>
                      <td class="px-4 py-3">
                        <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full"
                              [class]="getRoleName(user) === 'ADMIN' ? 'bg-red-100 text-red-700' : getRoleName(user) === 'SELLER' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                          {{ getRoleName(user) }}
                        </span>
                      </td>
                      <td class="px-4 py-3">
                        <span class="px-2 py-0.5 text-xs rounded-full"
                              [class]="user.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                          {{ user.enabled ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-right">
                        @if (getRoleName(user) !== 'ADMIN') {
                          <button (click)="deleteUser(user.id)"
                                  [disabled]="processing() === user.id"
                                  class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                                  title="Delete user">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  activeTab = signal<Tab>('overview');
  stats = signal<SystemStats | null>(null);
  users = signal<User[]>([]);
  orders = signal<AdminOrder[]>([]);
  items = signal<AdminItem[]>([]);
  pendingSellers = signal<User[]>([]);

  loadingUsers = signal(true);
  loadingOrders = signal(false);
  loadingItems = signal(false);
  loadingSellers = signal(true);
  processing = signal<number | null>(null);

  readonly orderStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  readonly tabs: { id: Tab; label: string }[] = [
    { id: 'overview',  label: '📊 Overview'  },
    { id: 'orders',    label: '📦 Orders'    },
    { id: 'products',  label: '🛍️ Products'  },
    { id: 'sellers',   label: '🏪 Sellers'   },
    { id: 'users',     label: '👥 Users'     },
  ];

  ngOnInit() {
    this.adminService.getStats().subscribe({ next: s => this.stats.set(s), error: () => {} });
    this.loadUsers();
    this.loadPendingSellers();
    this.loadOrders();
    this.loadItems();
  }

  loadUsers() {
    this.loadingUsers.set(true);
    this.adminService.getAllUsers().subscribe({
      next: u => { this.users.set(u); this.loadingUsers.set(false); },
      error: () => this.loadingUsers.set(false)
    });
  }

  loadOrders() {
    this.loadingOrders.set(true);
    this.adminService.getAllOrders().subscribe({
      next: o => { this.orders.set(o); this.loadingOrders.set(false); },
      error: () => this.loadingOrders.set(false)
    });
  }

  loadItems() {
    this.loadingItems.set(true);
    this.adminService.getAllItems().subscribe({
      next: page => { this.items.set(page.content ?? page); this.loadingItems.set(false); },
      error: () => this.loadingItems.set(false)
    });
  }

  loadPendingSellers() {
    this.loadingSellers.set(true);
    this.adminService.getPendingSellers().subscribe({
      next: s => { this.pendingSellers.set(s); this.loadingSellers.set(false); },
      error: () => this.loadingSellers.set(false)
    });
  }

  updateOrderStatus(order: AdminOrder) {
    this.adminService.updateOrderStatus(order.id, order.status).subscribe({ error: () => {} });
  }

  deleteItem(id: number) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    this.processing.set(id);
    this.adminService.deleteItem(id).subscribe({
      next: () => { this.items.update(list => list.filter(i => i.id !== id)); this.processing.set(null); },
      error: () => this.processing.set(null)
    });
  }

  approveSeller(id: number) {
    this.processing.set(id);
    this.adminService.approveSeller(id).subscribe({
      next: () => {
        this.pendingSellers.update(list => list.filter(s => s.id !== id));
        this.processing.set(null);
        this.loadUsers();
      },
      error: () => this.processing.set(null)
    });
  }

  rejectSeller(id: number) {
    if (!confirm('Reject and delete this seller application?')) return;
    this.processing.set(id);
    this.adminService.rejectSeller(id).subscribe({
      next: () => {
        this.pendingSellers.update(list => list.filter(s => s.id !== id));
        this.users.update(list => list.filter(u => u.id !== id));
        this.processing.set(null);
      },
      error: () => this.processing.set(null)
    });
  }

  deleteUser(id: number) {
    if (!confirm('Delete this user? All their data will be removed.')) return;
    this.processing.set(id);
    this.adminService.deleteUser(id).subscribe({
      next: () => { this.users.update(list => list.filter(u => u.id !== id)); this.processing.set(null); },
      error: () => this.processing.set(null)
    });
  }

  getRoleName(user: any): string {
    if (!user.role) return 'USER';
    if (typeof user.role === 'string') return user.role;
    return user.role?.name ?? 'USER';
  }

  getOrderStatusEntries(): [string, number][] {
    const s = this.stats();
    if (!s?.orderStatusCount) return [];
    return Object.entries(s.orderStatusCount) as [string, number][];
  }

  getStatusColorClass(status: string): string {
    return STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700';
  }
}
