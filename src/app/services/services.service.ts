import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface BackendService {
  _id?: string;
  title: string;
  category: string;
  description: string;
  price?: number;
  features: string[];
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/services`;

  getServices(): Observable<BackendService[]> {
    return this.http.get<BackendService[]>(this.apiUrl);
  }

  updateService(id: string, serviceData: Partial<BackendService>): Observable<{ message: string; data: BackendService }> {
    return this.http.put<{ message: string; data: BackendService }>(
      `${this.apiUrl}/${id}`,
      serviceData,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  createService(serviceData: Partial<BackendService>): Observable<{ message: string; data: BackendService }> {
    return this.http.post<{ message: string; data: BackendService }>(
      this.apiUrl,
      serviceData,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  deleteService(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders(),
    });
  }
}
