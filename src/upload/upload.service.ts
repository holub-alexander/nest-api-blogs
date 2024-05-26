import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {}

  private readonly s3Client = new S3Client({ region: process.env.AWS_S3_REGION });

  async uploadFile(file: Express.Multer.File) {
    const { originalname, buffer } = file;

    const uploadResult = await this.s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: originalname,
        Body: buffer,
      }),
    );

    return uploadResult;
  }
}
