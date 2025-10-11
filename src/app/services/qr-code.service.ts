import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { PdfUploadResponse } from '../interfaces/pdf.interface';
import { QrCodeGenerationResponse } from '../interfaces/qrcode.interface';

export interface QrCodeMetadata {
  qrCodeMetadataId: string;
  qrCodeId: string;
  downloadUrl: string;
  filePath: string;
  pdfId: string;
  qrContent: string;
  generationDate: string;
  imageFormat: string;
  imageSize: number;
  userId: number;
  pdfMetadataId: number;
}

export interface PdfMetadata {
  id: number;
  uniqueId: string;
  originalFilename: string;
  filePath: string;
  fileSize: number;
  uploadDate: string;
  contentType: string;
  userId: number;
}

@Injectable({
  providedIn: 'root'
})
export class QrCodeService {
  private apiUrl: string | undefined;
  private isProd = environment.production;

  constructor(private http: HttpClient) { 
    // Définir l'URL de l'API selon l'environnement
    if (this.isProd) {
      this.apiUrl = environment.apiUrlProd;
    } else {
      this.apiUrl = environment.apiUrlDev;
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Méthodes pour les PDFs
  uploadPdf(file: File): Observable<PdfUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });

    return this.http.post<PdfUploadResponse>(`${this.apiUrl}/pdf/upload`, formData, { headers });
  }

  getUserPdfs(): Observable<PdfMetadata[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<PdfMetadata[]>(`${this.apiUrl}/pdf/user-pdfs`, { headers });
  }

  getPdfInfo(uniqueId: string): Observable<PdfMetadata> {
    const headers = this.getAuthHeaders();
    return this.http.get<PdfMetadata>(`${this.apiUrl}/pdf/info/${uniqueId}`, { headers });
  }

  deletePdf(uniqueId: string): Observable<string> {
    const headers = this.getAuthHeaders();
    return this.http.delete<string>(`${this.apiUrl}/pdf/${uniqueId}`, { headers });
  }

  // Méthodes pour les QR Codes
  generateQrCode(pdfUniqueId: string, logoPath?: File): Observable<QrCodeGenerationResponse> {
    const headers = this.getAuthHeaders();
    const formData = new FormData();
    
    if (logoPath) {
      formData.append('logo', logoPath);
    }
    return this.http.post<QrCodeGenerationResponse>(`${this.apiUrl}/qrcode/generate/${pdfUniqueId}`, formData, { headers });
  }

  getUserQrCodes(): Observable<QrCodeMetadata[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<QrCodeMetadata[]>(`${this.apiUrl}/users/qrcodes`, { headers });
  }

  getQrCodeInfo(uniqueId: string): Observable<QrCodeMetadata> {
    const headers = this.getAuthHeaders();
    return this.http.get<QrCodeMetadata>(`${this.apiUrl}/qrcode/info/${uniqueId}`, { headers });
  }

  deleteQrCode(uniqueId: string): Observable<string> {
    const headers = this.getAuthHeaders();
    return this.http.delete<string>(`${this.apiUrl}/qrcode/${uniqueId}`, { headers });
  }

  downloadQrCode(uniqueId: string): Observable<Blob> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/qrcode/download/${uniqueId}`, { 
      headers, 
      responseType: 'blob' 
    });
  }

  // Méthodes utilitaires
  getPdfViewUrl(uniqueId: string): string {
    return `${this.apiUrl}/pdf/view/${uniqueId}`;
  }

  getPdfDownloadUrl(uniqueId: string): string {
    return `${this.apiUrl}/pdf/download/${uniqueId}`;
  }

  getQrCodeImageUrl(uniqueId: string): string {
    return `${this.apiUrl}/qrcode/image/${uniqueId}`;
  }

  viewQrCode(qrCodeId: string): string {
    return `${this.apiUrl}/qrcode/view/${qrCodeId}`;
  }
}

