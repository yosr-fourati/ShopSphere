import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthRequest, AuthResponse, RegisterRequest, User } from '../models';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  userId: number;
  role: string;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'shopsphere_token';
  private readonly REFRESH_KEY = 'shopsphere_refresh';

  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromToken();
  }

  login(request: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/authenticate`, request).pipe(
      tap(res => this.storeTokens(res))
    );
  }

  register(request: RegisterRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, request);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token || token === 'undefined' || token === 'null' || token.split('.').length !== 3) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_KEY);
      return null;
    }
    return token;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.role;
    } catch {
      return null;
    }
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.userId;
    } catch {
      return null;
    }
  }

  private storeTokens(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.accessToken);
    localStorage.setItem(this.REFRESH_KEY, res.refreshToken);
    this.loadUserFromToken();
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (!token) return;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      this.currentUser.set({
        id: decoded.userId,
        email: decoded.sub,
        role: decoded.role as 'USER' | 'SELLER' | 'ADMIN',
        firstname: '',
        lastname: '',
        enabled: true,
      });
    } catch {
      this.currentUser.set(null);
    }
  }
}
