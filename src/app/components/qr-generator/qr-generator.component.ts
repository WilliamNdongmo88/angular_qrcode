import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfService } from '../../services/pdf.service';
import { QrcodeService } from '../../services/qrcode.service';
import { PdfUploadResponse } from '../../interfaces/pdf.interface';
import { QrCodeGenerationResponse } from '../../interfaces/qrcode.interface';

@Component({
  selector: 'app-qr-generator',
  imports: [CommonModule, FormsModule],
  templateUrl: './qr-generator.component.html',
  styleUrl: './qr-generator.component.css'
})
export class QrGeneratorComponent {
  selectedFile: File | null = null;
  selectedLogo: File | null = null;
  logoPreviewUrl: string = '';
  isUploading = false;
  isGeneratingQr = false;
  uploadedPdf: PdfUploadResponse | null = null;
  generatedQrCode: QrCodeGenerationResponse | null = null;
  errorMessage = '';
  successMessage = '';

  constructor(
    private pdfService: PdfService,
    private qrCodeService: QrcodeService
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Veuillez sélectionner un fichier PDF valide.';
      this.selectedFile = null;
    }
  }

  onLogoSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedLogo = file;
      this.errorMessage = '';
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    } else if (file) {
      this.errorMessage = 'Veuillez sélectionner un fichier image valide.';
      this.selectedLogo = null;
      this.logoPreviewUrl = '';
    }
  }

  removeLogo(): void {
    this.selectedLogo = null;
    this.logoPreviewUrl = '';
    // Réinitialiser l'input file
    const logoInput = document.getElementById('logoFile') as HTMLInputElement;
    if (logoInput) {
      logoInput.value = '';
    }
  }

  uploadPdf(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner un fichier PDF.';
      return;
    }

    this.isUploading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.pdfService.uploadPdf(this.selectedFile).subscribe({
      next: (response) => {
        this.uploadedPdf = response;
        this.successMessage = 'PDF téléchargé avec succès !';
        this.isUploading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du téléchargement du PDF: ' + (error.error || error.message);
        this.isUploading = false;
      }
    });
  }

  generateQrCode(): void {
    if (!this.uploadedPdf) {
      this.errorMessage = 'Veuillez d\'abord télécharger un PDF.';
      return;
    }

    this.isGeneratingQr = true;
    this.errorMessage = '';

    this.qrCodeService.generateQrCode(this.uploadedPdf.pdfId, this.selectedLogo).subscribe({
      next: (response) => {
        this.generatedQrCode = response;
        this.successMessage = 'QR Code généré avec succès !';
        this.isGeneratingQr = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la génération du QR Code: ' + (error.error || error.message);
        this.isGeneratingQr = false;
      }
    });
  }

  downloadQrCode(): void {
    if (this.generatedQrCode) {
      window.open(this.generatedQrCode.downloadUrl, '_blank');
    }
  }

  getQrCodeImageUrl(): string {
    if (this.generatedQrCode) {
      return this.qrCodeService.viewQrCode(this.generatedQrCode.qrCodeId);
    }
    return '';
  }

  viewPdf(): void {
    if (this.uploadedPdf) {
      window.open(this.pdfService.viewPdf(this.uploadedPdf.pdfId), '_blank');
    }
  }

  reset(): void {
    this.selectedFile = null;
    this.selectedLogo = null;
    this.logoPreviewUrl = '';
    this.uploadedPdf = null;
    this.generatedQrCode = null;
    this.errorMessage = '';
    this.successMessage = '';
    this.isUploading = false;
    this.isGeneratingQr = false;
    
    // Réinitialiser les inputs file
    const pdfInput = document.getElementById('pdfFile') as HTMLInputElement;
    const logoInput = document.getElementById('logoFile') as HTMLInputElement;
    if (pdfInput) pdfInput.value = '';
    if (logoInput) logoInput.value = '';
  }
}
