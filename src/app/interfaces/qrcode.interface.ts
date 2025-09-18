export interface QrCodeGenerationResponse {
  qrCodeId: string;
  pdfId: string;
  qrContent: string;
  downloadUrl: string;
  generationDate: string;
  message: string;
}

export interface QrCodeMetadata {
  id: number;
  uniqueId: string;
  filePath: string;
  pdfId: string;
  qrContent: string;
  generationDate: string;
  imageFormat: string;
  imageSize: number;
}

