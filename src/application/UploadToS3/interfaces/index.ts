import sharp from 'sharp';

export interface UploadedImage {
  bucketName: string;
  fileName: string;
  folder: string;
  metadata: sharp.Metadata;
}
