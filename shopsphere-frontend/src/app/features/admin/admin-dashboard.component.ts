import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, SystemStats } from '../../core/services/admin.service';
import { User } from '../../core/models';

type Tab = 'overview' | 'users' | 'sellers';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container py-10">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="section-title">Admin Dashboard</h1>
          <p class="text-gray-500 text-sm mt-1">Manage users, sellers, and platform stats</p>
        </div>
        <span class="badge badge-error">ADMIN</span>
      </div>

      <!-- Stats Row -->
      @if (stats()) {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="card p-5">
            <p class="text-2xl font-bold text-gray-900">{{ stats()!.totalUsers }}</p>
            <p class="text-xs text-gray-500 mt-0.5">Total Users</p>
          </div>
          <div class="card p-5">
            <p class="text-2xl font-bold text-gray-900">{{ stats()!.totalOrders }}</p>
            <p class="text-xs text-gray-500 mt-0.5">Total Orders</p>
          </div>
          <div class="card p-5">
            <p class="text-2xl font-bold text-gray-900">\${{ stats()!.totalSales | number:'1.0-0' }}</p>
            <p class="text-xs text-gray-500 mt-0.5">Total Sales</p>
          </div>
          <div class="card p-5 relative">
            <p class="text-2xl font-bold text-gray-900">{{ pendingSellers().length }}</p>
            <p class="text-xs text-gray-500 mt-0.5">Pending Sellers</p>
            @if (pendingSellers().length > 0) {
              <span class="absolute top-3 right-3 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {{ pendingSellers().length }}
              </span>
            }
          </div>
        </div>
      } @else {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          @for (i of [1,2,3,4]; track i) {
            <div class="card p-5 animate-pulse">
              <div class="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          }
        </div>
      }

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 mb-6">
        <button (click)="activeTab.set('overview')"
                [class]="activeTab() === 'overview' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500 hover:text-gray-700'"
                class="px-6 py-3 text-sm transition-colors">
          Overview
        </button>
        <button (click)="activeTab.set('sellers')"
                [class]="activeTab() === 'sellers' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500 hover:text-gray-700'"
                class="px-6 py-3 text-sm transition-colors flex items-center gap-2">
          Pending Sellers
          @if (pendingSellers().length > 0) {
            <span class="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{{ pendingSellers().length }}</span>
          }
        </button>
        <button (click)="activeTab.set('users')"
                [class]="activeTab() === 'users' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500 hover:text-gray-700'"
                class="px-6 py-3 text-sm transition-colors">
          All Users
        </button>
      </div>

      <!-- Overview Tab -->
      @if (activeTab() === 'overview') {
        <div class="grid md:grid-cols-2 gap-6">
          @if (stats()) {
            <div class="card p-6">
              <h2 class="font-bold text-gray-900 mb-4">Order Status</h2>
              <div class="space-y-3">
                @for (entry of getOrderStatusEntries(); track entry[0]) {
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">{{ entry[0] }}</span>
                    <span class="badge" [class]="getStatusClass(entry[0])">{{ entry[1] }}</span>
                  </div>
                }
              </div>
            </div>
            <div class="card p-6">
              <h2 class="font-bold text-gray-900 mb-4">Platform Health</h2>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Active users (30d)</span>
                  <span class="font-semibold text-gray-900">{{ stats()!.activeUsers }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">New users (7d)</span>
                  <span class="font-semibold text-gray-900">{{ stats()!.newUsers }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Avg. order value</span>
                  <span class="font-semibold text-gray-900">\${{ stats()!.averageOrderValue | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Avg. product rating</span>
                  <span class="font-semibold text-gray-900">{{ stats()!.averageRating | number:'1.1-1' }} / 5</span>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Pending Sellers Tab -->
      @if (activeTab() === 'sellers') {
        @if (loadingSellers()) {
          <div class="space-y-3">
            @for (i of [1,2,3]; track i) {
              <div class="card p-5 animate-pulse">
                <div class="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            }
          </div>
        } @else if (pendingSellers().length === 0) {
          <div class="text-center py-16 text-gray-400">
            <div class="text-5xl mb-4">✅</div>
            <p class="text-lg font-medium">No pending sellers</p>
            <p class="text-sm mt-1">All seller applications have been processed.</p>
          </div>
        } @else {
          <div class="space-y-3">
            @for (seller of pendingSellers(); track seller.id) {
              <div class="card p-5 flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <span class="text-lg font-bold text-amber-700">{{ seller.firstname?.charAt(0) }}</span>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900">{{ seller.firstname }} {{ seller.lastname }}</p>
                      <p class="text-sm text-gray-500">{{ seller.email }}</p>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="badge badge-warning">Pending</span>
                  <button (click)="approveSeller(seller.id)"
                          [disabled]="processing() === seller.id"
                          class="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                    {{ processing() === seller.id ? '...' : 'Approve' }}
                  </button>
                  <button (click)="rejectSeller(seller.id)"
                          [disabled]="processing() === seller.id"
                          class="px-4 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            }
          </div>
        }
      }

      <!-- Users Tab -->
      @if (activeTab() === 'users') {
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
          <div class="space-y-2">
            @for (user of users(); track user.id) {
              <div class="card p-4 flex items-center gap-4">
                <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                     [class]="getRoleName(user) === 'ADMIN' ? 'bg-red-100' : getRoleName(user) === 'SELLER' ? 'bg-blue-100' : 'bg-gray-100'">
                  <span class="text-sm font-bold"
                        [class]="getRoleName(user) === 'ADMIN' ? 'text-red-700' : getRoleName(user) === 'SELLER' ? 'text-blue-700' : 'text-gray-700'">
                    {{ user.firstname?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 truncate">{{ user.firstname }} {{ user.lastname }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="badge" [class]="getRoleName(user) === 'ADMIN' ? 'badge-error' : getRoleName(user) === 'SELLER' ? 'badge-info' : 'badge-success'">
                    {{ getRoleName(user) }}
                  </span>
                  @if (!user.enabled) {
                    <span class="badge badge-warning text-xs">Inactive</span>
                  }
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
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  activeTab = signal<Tab>('overview');
  stats = signal<SystemStats | null>(null);
  users = signal<User[]>([]);
  pendingSellers = signal<User[]>([]);
  loadingUsers = signal(true);
  loadingSellers = signal(true);
  processing = signal<number | null>(null);

  ngOnInit() {
    this.adminService.getStats().subscribe({
      next: s => this.stats.set(s),
      error: () => {}
    });

    this.adminService.getAllUsers().subscribe({
      next: u => { this.users.set(u); this.loadingUsers.set(false); },
      error: () => this.loadingUsers.set(false)
    });

    this.loadPendingSellers();
  }

  loadPendingSellers() {
    this.loadingSellers.set(true);
    this.adminService.getPendingSellers().subscribe({
      next: s => { this.pendingSellers.set(s); this.loadingSellers.set(false); },
      error: () => this.loadingSellers.set(false)
    });
  }

  approveSeller(id: number) {
    this.processing.set(id);
    this.adminService.approveSeller(id).subscribe({
      next: () => {
        this.pendingSellers.update(list => list.filter(s => s.id !== id));
        this.processing.set(null);
        // Refresh user list to show updated status
        this.adminService.getAllUsers().subscribe(u => this.users.set(u));
      },
      error: () => this.processing.set(null)
    });
  }

  rejectSeller(id: number) {
    if (!confirm('Reject this seller application? Their account will be deleted.')) return;
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

  getRoleName(user: any): string {
    if (!user.role) return 'USER';
    if (typeof user.role === 'string') return user.role;
    return user.role?.name ?? 'USER';
  }

  deleteUser(id: number) {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    this.processing.set(id);
    this.adminService.deleteUser(id).subscribe({
      next: () => {
        this.users.update(list => list.filter(u => u.id !== id));
        this.processing.set(null);
      },
      error: () => this.processing.set(null)
    });
  }

  getOrderStatusEntries(): [string, number][] {
    const s = this.stats();
    if (!s?.orderStatusCount) return [];
    return Object.entries(s.orderStatusCount) as [string, number][];
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING:   'badge-warning',
      CONFIRMED: 'badge-info',
      SHIPPED:   'badge-info',
      DELIVERED: 'badge-success',
      CANCELLED: 'badge-error',
    };
    return map[status] ?? 'badge-info';
  }
}
