import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PdfUploadResponse, PdfMetadata } from '../interfaces/pdf.interface';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private apiUrl = 'http://localhost:8071/api/pdf';

  constructor(private http: HttpClient) { }

  uploadPdf(file: File): Observable<PdfUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<PdfUploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  getPdfInfo(pdfId: string): Observable<PdfMetadata> {
    return this.http.get<PdfMetadata>(`${this.apiUrl}/info/${pdfId}`);
  }

  viewPdf(pdfId: string): string {
    return `${this.apiUrl}/view/${pdfId}`;
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
