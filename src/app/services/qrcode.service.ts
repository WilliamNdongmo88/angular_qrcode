import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QrCodeGenerationResponse, QrCodeMetadata } from '../interfaces/qrcode.interface';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class QrcodeService {
  //private apiUrl = 'http://localhost:8071/api/qrcode';
  //private apiUrl = 'https://sol-solution-production.up.railway.app/api/qrcode';

  private apiUrl: string | undefined;
  private isProd = environment.production;

  constructor(private http: HttpClient) {
    // Définir l'URL de l'API selon l'environnement
    if (this.isProd) {
      this.apiUrl = environment.apiUrlProd + '/qrcode';
    } else {
      this.apiUrl = environment.apiUrlDev + '/qrcode';
    }
  }

  generateQrCode(pdfId: string, logoFile?: File | null): Observable<QrCodeGenerationResponse> {
    const formData = new FormData();
    
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    
    return this.http.post<QrCodeGenerationResponse>(`${this.apiUrl}/generate/${pdfId}`, formData);
  }

  getQrCodeInfo(qrCodeId: string): Observable<QrCodeMetadata> {
    return this.http.get<QrCodeMetadata>(`${this.apiUrl}/info/${qrCodeId}`);
  }

  viewQrCode(qrCodeId: string): string {
    return `${this.apiUrl}/view/${qrCodeId}`;
  }

  downloadQrCode(qrCodeId: string): string {
    return `${this.apiUrl}/download/${qrCodeId}`;
  }

  deleteQrCode(qrCodeId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${qrCodeId}`);
  }
}
