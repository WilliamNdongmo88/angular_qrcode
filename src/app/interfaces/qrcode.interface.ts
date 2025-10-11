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
  qrName: string;
  qrCodeId: string;
  filePath: string;
  pdfId: string;
  qrContent: string;
  generationDate: string;
  imageFormat: string;
  imageSize: number;
  userName: string;
  pdfMetadataName: string;
}
