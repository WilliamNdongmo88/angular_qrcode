import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QrCodeService, PdfMetadata, QrCodeMetadata } from '../../services/qr-code.service';
import { AuthService } from '../../services/auth.service';
import { PdfUploadResponse } from '../../interfaces/pdf.interface';
import { PdfService } from '../../services/pdf.service';
import { QrCodeGenerationResponse } from '../../interfaces/qrcode.interface';
import { HeaderComponent } from "../header/header";

@Component({
  selector: 'app-qr-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './qr-generator.component.html',
  styleUrl: './qr-generator.component.css'
})
export class QrGeneratorComponent implements OnInit {
  selectedFile: File | null = null;
  selectedLogo: File | null = null;
  logoPreviewUrl: string = '';
  userPdfs: PdfMetadata[] = [];
  isUploading: boolean = false;
  isGenerating: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  uploadedPdf: PdfUploadResponse | null = null;
  generatedQrCode: QrCodeGenerationResponse | null = null;

  isUploadPdfOff = true;
  isUploadPdfOn = false;
  isLogoOff = false;
  isLogoOn = false;
  isQrcodeOff = false;
  isQrcodeOn = false;

  constructor(
    private qrCodeService: QrCodeService,
    private authService: AuthService,
    private pdfService: PdfService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/user-login']);
      return;
    }
    this.loadUserPdfs();
  }

  loadUserPdfs() {
    this.qrCodeService.getUserPdfs().subscribe({
      next: (pdfs) => {
        this.userPdfs = pdfs;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des PDFs:', error);
        this.errorMessage = 'Erreur lors du chargement de vos PDFs';
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.errorMessage = 'Veuillez sélectionner un fichier PDF';
        return;
      }
      this.selectedFile = file;
      this.errorMessage = '';
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

  uploadPdf() {
    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner un fichier PDF';
      return;
    }

    this.isUploading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.pdfService.uploadPdf(this.selectedFile).subscribe({//qrCodeService
      next: (pdfMetadata) => {
        this.uploadedPdf = pdfMetadata;
        this.isUploadPdfOn = true;
        this.isUploadPdfOff = false;
        // console.log('Fichier PDF uploadé avec succès:', this.uploadedPdf);
        // console.log('this.uploadedPdf.pdfId:', this.uploadedPdf.uniqueId);
        this.isUploading = false;
        this.successMessage = 'PDF uploadé avec succès !';
        this.selectedFile = null;
        this.loadUserPdfs(); // Recharger la liste des PDFs
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
        
        // Réinitialiser le champ de fichier
        const fileInput = document.getElementById('pdfFile') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      },
      error: (error) => {
        this.isUploading = false;
        if (error.error && error.error.error) {
          console.error("❌ Erreur backend :", error.error.error);
          this.errorMessage = error.error.error;
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        } else {
          console.error("❌ Erreur inconnue :", error);
           if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = "❌ Une erreur inattendue est survenue.";
          }
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        }
      }
    });
  }

  generateQrCode() {
    if (!this.uploadedPdf) {// || !this.selectedLogo
      this.errorMessage = 'Veuillez sélectionner un PDF et un logo';
      confirm('Veuillez sélectionner un logo');
      return;
    }

    this.isGenerating = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.generatedQrCode = null;
    console.log('#####Fichier PDF sélectionné: ', this.uploadedPdf);
    this.qrCodeService.generateQrCode(this.uploadedPdf.uniqueId).subscribe({
      next: (qrCodeMetadata) => {
        this.isQrcodeOff = false;
        this.isQrcodeOn = true;
        console.log('QR Code généré avec succès: ', qrCodeMetadata);
        this.isGenerating = false;
        this.generatedQrCode = qrCodeMetadata;
        this.successMessage = 'QR Code généré avec succès ! Un email avec le QR Code vous a été envoyé.';
      },
      error: (error) => {
        this.isGenerating = false;
        this.errorMessage = 'Erreur lors de la génération du QR Code';
        console.error('Erreur génération QR:', error);
      }
    });
  }

  downloadQrCode(): void {
    console.log("Start download ...")
    if (this.generatedQrCode) {
      console.log("generated QR Code URL: ", this.generatedQrCode.downloadUrl);
      window.open(this.generatedQrCode.downloadUrl, '_blank');
    }
  }

  getQrCodeImageUrl(): string {
    if (this.generatedQrCode) {
      return this.qrCodeService.viewQrCode(this.generatedQrCode.qrCodeId);
    }
    return '';
  }

  viewPdf(uniqueId: string) {
    console.log('Unique ID du PDF:', uniqueId);
    const url = this.qrCodeService.getPdfViewUrl(uniqueId);
    console.log("Url :: ", url);
    window.open(url, '_blank');
  }

  nextTab(): void {
    this.isUploadPdfOn = false;
    this.isQrcodeOff = true;
  }

  nextGenerateQrCodeTab(): void {
    this.isQrcodeOff = false;
  }

  goToDashboard() {
    this.router.navigate(['/user/dashboard']);
  }

  reset() {
    this.selectedFile = null;
    this.selectedLogo = null;
    this.logoPreviewUrl = '';
    this.uploadedPdf = null;
    this.generatedQrCode = null;
    this.errorMessage = '';
    this.successMessage = '';
    this.isUploading = false;
    this.isGenerating = false;
    this.isUploadPdfOff = true;
    this.isQrcodeOn = false;
    // console.log("isUploadPdfOff :: ", this.isUploadPdfOff);
    // console.log("isUploadPdfOn :: ", this.isUploadPdfOn);
    // console.log("isLogoOff :: ", this.isLogoOff);
    // console.log("isLogoOn :: ", this.isLogoOn);
    // console.log("isQrcodeOff :: ", this.isQrcodeOff);
    // console.log("isQrcodeOn :: ", this.isQrcodeOn);
    // Réinitialiser l'input file
    const pdfInput = document.getElementById('pdfFile') as HTMLInputElement;
    if (pdfInput) pdfInput.value = '';
  }
}

