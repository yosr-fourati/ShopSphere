import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div class="w-full max-w-md">
        <div class="card p-8">
          <div class="text-center mb-8">
            <div class="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900">Create your account</h1>
            <p class="text-gray-500 text-sm mt-1">Join thousands of shoppers on ShopSphere</p>
          </div>

          @if (success()) {
            <div class="text-center py-6">
              @if (role === 'SELLER') {
                <div class="text-5xl mb-4">🏪</div>
                <h2 class="text-xl font-bold text-gray-900 mb-2">Almost there!</h2>
                <p class="text-gray-500 text-sm mb-3">
                  We sent an activation email to <strong>{{ email }}</strong>.
                </p>
                <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left">
                  <p class="text-sm text-amber-800 font-medium mb-1">Seller account — two steps to go:</p>
                  <ol class="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                    <li>Activate your email (check your inbox)</li>
                    <li>Wait for admin approval — you'll be able to log in once approved</li>
                  </ol>
                </div>
              } @else {
                <div class="text-5xl mb-4">✉️</div>
                <h2 class="text-xl font-bold text-gray-900 mb-2">Check your email!</h2>
                <p class="text-gray-500 text-sm">
                  We sent an activation link to <strong>{{ email }}</strong>.
                  Click the link to activate your account.
                </p>
              }
              <a routerLink="/auth/login" class="btn-primary mt-6 inline-block">Go to Sign In</a>
            </div>
          } @else {
            <!-- Account type selector -->
            <div class="flex rounded-xl border border-gray-200 overflow-hidden mb-6">
              <button type="button"
                      (click)="role = 'USER'"
                      [class]="role === 'USER' ? 'flex-1 py-2.5 text-sm font-semibold bg-primary-600 text-white' : 'flex-1 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors'">
                I'm a Buyer
              </button>
              <button type="button"
                      (click)="role = 'SELLER'"
                      [class]="role === 'SELLER' ? 'flex-1 py-2.5 text-sm font-semibold bg-primary-600 text-white' : 'flex-1 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors'">
                I'm a Seller
              </button>
            </div>

            @if (role === 'SELLER') {
              <div class="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                Seller accounts require admin approval before you can list products. You'll be notified by email.
              </div>
            }

            <form (ngSubmit)="onSubmit()">
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                    <input [(ngModel)]="firstname" name="firstname" type="text" required
                           placeholder="Yosr" class="input-field"/>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                    <input [(ngModel)]="lastname" name="lastname" type="text" required
                           placeholder="Fourati" class="input-field"/>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <input [(ngModel)]="email" name="email" type="email" required
                         placeholder="you@example.com" class="input-field"/>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Date of birth</label>
                  <input [(ngModel)]="dateOfBirth" name="dateOfBirth" type="date" required
                         [max]="maxDate" class="input-field"/>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div class="relative">
                    <input [(ngModel)]="password" name="password" [type]="showPwd ? 'text' : 'password'" required
                           placeholder="Minimum 8 characters" class="input-field pr-10"
                           minlength="8"/>
                    <button type="button" (click)="showPwd = !showPwd"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {{ showPwd ? '🙈' : '👁️' }}
                    </button>
                  </div>
                  @if (password && password.length < 8) {
                    <p class="text-xs text-red-500 mt-1">Password must be at least 8 characters</p>
                  }
                </div>

                <!-- Password strength -->
                @if (password.length >= 8) {
                  <div class="flex items-center gap-2">
                    <div class="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-300"
                           [style.width]="passwordStrength() + '%'"
                           [class]="passwordStrength() < 40 ? 'bg-red-400' : passwordStrength() < 70 ? 'bg-yellow-400' : 'bg-green-400'">
                      </div>
                    </div>
                    <span class="text-xs" [class]="passwordStrength() < 40 ? 'text-red-500' : passwordStrength() < 70 ? 'text-yellow-500' : 'text-green-600'">
                      {{ passwordStrength() < 40 ? 'Weak' : passwordStrength() < 70 ? 'Fair' : 'Strong' }}
                    </span>
                  </div>
                }
              </div>

              @if (errorMsg()) {
                <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {{ errorMsg() }}
                </div>
              }

              <button type="submit"
                      [disabled]="loading() || !firstname || !lastname || !email || !dateOfBirth || password.length < 8"
                      class="btn-primary w-full mt-6 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                @if (loading()) {
                  <span class="inline-flex items-center gap-2">
                    <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Creating account...
                  </span>
                } @else {
                  {{ role === 'SELLER' ? 'Apply as Seller' : 'Create Account' }}
                }
              </button>
            </form>

            <p class="text-center text-sm text-gray-500 mt-6">
              Already have an account?
              <a routerLink="/auth/login" class="text-primary-600 font-medium hover:underline ml-1">Sign in</a>
            </p>
          }
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  firstname = '';
  lastname = '';
  email = '';
  dateOfBirth = '';
  password = '';
  role = 'USER';
  showPwd = false;
  loading = signal(false);
  errorMsg = signal('');
  success = signal(false);

  // Max date: user must be at least 13 years old
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0];

  passwordStrength(): number {
    let score = 0;
    if (this.password.length >= 8) score += 25;
    if (this.password.length >= 12) score += 15;
    if (/[A-Z]/.test(this.password)) score += 20;
    if (/[0-9]/.test(this.password)) score += 20;
    if (/[^A-Za-z0-9]/.test(this.password)) score += 20;
    return Math.min(score, 100);
  }

  onSubmit() {
    if (!this.firstname || !this.lastname || !this.email || !this.dateOfBirth || this.password.length < 8) return;
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.register({
      firstname: this.firstname,
      lastname: this.lastname,
      email: this.email,
      dateOfBirth: this.dateOfBirth,
      password: this.password,
      role: this.role
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 400) {
          const msg = err.error?.validationErrors?.join(', ') || err.error?.error || 'Please check your details.';
          this.errorMsg.set(msg);
        } else if (err.status === 409) {
          this.errorMsg.set('Email already registered. Try signing in.');
        } else if (err.status === 0) {
          this.errorMsg.set('Cannot connect to server. Make sure the backend is running.');
        } else {
          this.errorMsg.set('Registration failed. Please try again.');
        }
      }
    });
  }
}
