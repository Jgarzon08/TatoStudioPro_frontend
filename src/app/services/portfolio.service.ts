import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface PortfolioItem {
  _id?: string;
  title: string;
  imageUrl: string;
  publicId?: string;
  category: string;
  tags?: string[];
  isFeatured?: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/portafolio`;

  getPortfolio(): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(this.apiUrl);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  uploadPhotos(formData: FormData): Observable<{ message: string; count?: number; data: any }> {
    return this.http.post<{ message: string; count?: number; data: any }>(
      `${this.apiUrl}/upload`,
      formData,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  deletePhoto(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }
}
