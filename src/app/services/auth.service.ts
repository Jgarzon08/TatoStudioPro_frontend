import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  private readonly tokenKey = 'tato_token';
  private readonly userKey = 'tato_user';

  readonly token = signal<string | null>(this.getStoredToken());
  readonly currentUser = signal<AuthUser | null>(this.getStoredUser());
  readonly isAuthenticated = computed(() => !!this.token());

  private getStoredToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  private getStoredUser(): AuthUser | null {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.userKey);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  getAuthHeaders(): HttpHeaders {
    const currentToken = this.token();
    if (currentToken) {
      return new HttpHeaders({
        Authorization: `Bearer ${currentToken}`,
      });
    }
    return new HttpHeaders();
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.token) {
          this.token.set(res.token);
          this.currentUser.set(res.user);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.tokenKey, res.token);
            localStorage.setItem(this.userKey, JSON.stringify(res.user));
          }
        }
      })
    );
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }
}
