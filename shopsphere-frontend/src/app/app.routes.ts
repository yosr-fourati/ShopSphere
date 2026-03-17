import { Routes } from '@angular/router';
import { authGuard, sellerGuard, guestGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'activate-account',
        loadComponent: () => import('./features/auth/activate/activate.component').then(m => m.ActivateComponent)
      },
    ]
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () => import('./features/orders/order-history.component').then(m => m.OrderHistoryComponent)
  },
  {
    path: 'seller',
    canActivate: [sellerGuard],
    loadComponent: () => import('./features/seller/seller-dashboard.component').then(m => m.SellerDashboardComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
