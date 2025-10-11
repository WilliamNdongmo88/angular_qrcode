import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl: string | undefined;
  private isProd = environment.production;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Définir l'URL de l'API selon l'environnement
    if (this.isProd) {
      this.apiUrl = environment.apiUrlProd + '/pdf';
    } else {
      this.apiUrl = environment.apiUrlDev + '/pdf';
    }
  }

  getUserProfile(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/users/profile`, { headers });
  }

  updateUserProfile(profileData: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<any>(`${this.apiUrl}/users/profile`, profileData, { headers });
  }

  getUserActions(): Observable<any[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/users/actions`, { headers });
  }

  getUserQrCodes(): Observable<any[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/users/qrcodes`, { headers });
  }
}

