import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PdfUploadResponse, PdfMetadata } from '../interfaces/pdf.interface';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  //private apiUrl = 'http://localhost:8071/api/pdf';
  // private apiUrl = 'https://sol-solution-production.up.railway.app/api/pdf';
  private apiUrl: string | undefined;
  private isProd = environment.production;

  constructor(private http: HttpClient) {
    // Définir l'URL de l'API selon l'environnement
    if (this.isProd) {
      this.apiUrl = environment.apiUrlProd + '/pdf';
    } else {
      this.apiUrl = environment.apiUrlDev + '/pdf';
    }
  }

  uploadPdf(file: File): Observable<PdfUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<PdfUploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  getPdfInfo(pdfId: string): Observable<PdfMetadata> {
    return this.http.get<PdfMetadata>(`${this.apiUrl}/info/${pdfId}`);
  }

  viewPdf(pdfUniqueId: string): string {
    // console.log('Unique ID du PDF:', pdfUniqueId);
    // console.log('API URL pour visualiser le PDF:', this.apiUrl);
    return `${this.apiUrl}/view/${pdfUniqueId}`;
  }

  downloadPdf(pdfId: string): string {
    return `${this.apiUrl}/download/${pdfId}`;
  }

  extractTextFromPdf(pdfId: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/text/${pdfId}`, { responseType: 'text' });
  }

  deletePdf(pdfId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${pdfId}`);
  }
}
