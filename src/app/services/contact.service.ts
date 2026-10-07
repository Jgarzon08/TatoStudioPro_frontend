import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface ContactMessagePayload {
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  message: string;
}

export interface ContactMessageItem extends ContactMessagePayload {
  _id: string;
  status: 'pendiente' | 'leido' | 'respondido';
  createdAt: string;
}

export interface ContactResponse {
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/contact`;

  // Público
  sendMessage(payload: ContactMessagePayload): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(this.apiUrl, payload);
  }

  // Protegidos (CMS)
  getMessages(): Observable<ContactMessageItem[]> {
    return this.http.get<ContactMessageItem[]>(this.apiUrl, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  updateMessageStatus(id: string, status: string): Observable<{ message: string; data: ContactMessageItem }> {
    return this.http.put<{ message: string; data: ContactMessageItem }>(
      `${this.apiUrl}/${id}`,
      { status },
      { headers: this.authService.getAuthHeaders() }
    );
  }

  deleteMessage(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders(),
    });
  }
}
