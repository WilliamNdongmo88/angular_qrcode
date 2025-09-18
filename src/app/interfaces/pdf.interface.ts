export interface PdfUploadResponse {
  pdfId: string;
  originalFilename: string;
  fileSize: number;
  uploadDate: string;
  message: string;
}

export interface PdfMetadata {
  id: number;
  uniqueId: string;
  originalFilename: string;
  filePath: string;
  fileSize: number;
  uploadDate: string;
  contentType: string;
}

