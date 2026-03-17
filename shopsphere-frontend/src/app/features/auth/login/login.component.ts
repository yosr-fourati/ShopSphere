import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div class="w-full max-w-md">
        <!-- Card -->
        <div class="card p-8">
          <!-- Logo -->
          <div class="text-center mb-8">
            <div class="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 11H4L5 9z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p class="text-gray-500 text-sm mt-1">Sign in to your ShopSphere account</p>
          </div>

          <!-- Form -->
          <form (ngSubmit)="onSubmit()" #form="ngForm">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  [(ngModel)]="email" name="email" type="email" required
                  placeholder="you@example.com"
                  class="input-field"
                  [class.border-red-400]="errorMsg()"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div class="relative">
                  <input
                    [(ngModel)]="password" name="password" [type]="showPwd ? 'text' : 'password'" required
                    placeholder="Your password"
                    class="input-field pr-10"
                    [class.border-red-400]="errorMsg()"
                  />
                  <button type="button" (click)="showPwd = !showPwd"
                          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {{ showPwd ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>
            </div>

            @if (errorMsg()) {
              <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {{ errorMsg() }}
              </div>
            }

            <button
              type="submit"
              [disabled]="loading() || !email || !password"
              class="btn-primary w-full mt-6 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed">
              @if (loading()) {
                <span class="inline-flex items-center gap-2">
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Signing in...
                </span>
              } @else {
                Sign In
              }
            </button>
          </form>

          <p class="text-center text-sm text-gray-500 mt-6">
            Don't have an account?
            <a routerLink="/auth/register" class="text-primary-600 font-medium hover:underline ml-1">Create account</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  showPwd = false;
  loading = signal(false);
  errorMsg = signal('');

  onSubmit() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        const role = this.auth.getUserRole();
        if (role === 'ADMIN') this.router.navigate(['/admin']);
        else if (role === 'SELLER') this.router.navigate(['/seller']);
        else this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg: string = err.error?.message ?? err.error?.error ?? '';
        if (msg.toLowerCase().includes('locked')) {
          this.errorMsg.set('Your seller account is pending admin approval. You\'ll be able to log in once an admin approves your application.');
        } else if (msg.toLowerCase().includes('disabled') || msg.toLowerCase().includes('enabled')) {
          this.errorMsg.set('Please activate your account first. Check your email for the activation link.');
        } else if (err.status === 401 || err.status === 403) {
          this.errorMsg.set('Invalid email or password.');
        } else if (err.status === 0) {
          this.errorMsg.set('Cannot connect to server. Make sure the backend is running.');
        } else {
          this.errorMsg.set('Something went wrong. Please try again.');
        }
      }
    });
  }
}
