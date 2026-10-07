import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface UserItem {
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getUsers(): Observable<UserItem[]> {
    return this.http.get<UserItem[]>(this.apiUrl, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  createUser(payload: CreateUserPayload): Observable<{ message: string; user: UserItem }> {
    return this.http.post<{ message: string; user: UserItem }>(
      `${this.apiUrl}/register`,
      payload,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders(),
    });
  }
}
