import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { UploadedImage } from './interfaces';

@Injectable()
export class UploadToS3Service {
  constructor(private readonly configService: ConfigService) {}

  private readonly s3Client = new S3Client({ region: process.env.AWS_S3_REGION });

  async uploadFile(fileBuffer: Buffer, folder = 'blogs/wallpapers'): Promise<UploadedImage> {
    try {
      const fileName = `${uuidv4()}`;
      const fullPath = `${folder}/${fileName}`;

      const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME') || '';

      const metadata = await sharp(fileBuffer).metadata();
      const uploadResult = await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fullPath,
          Body: fileBuffer,
          ACL: 'public-read',
          ContentType: metadata.format,
          ContentDisposition: 'inline',
        }),
      );

      return {
        bucketName,
        fileName,
        folder,
        metadata,
      };
    } catch (err) {
      console.log('[SERVER ERROR][UploadToS3Service:uploadFile]: ', err);
      throw err;
    }
  }
}
