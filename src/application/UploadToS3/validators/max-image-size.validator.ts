import { FileValidator } from '@nestjs/common';
import sharp from 'sharp';

export class MaxImageSizeValidator extends FileValidator<{ maxWidth: number; maxHeight: number }> {
  buildErrorMessage() {
    return 'This file has invalid sizes, please upload a file with valid size';
  }

  async isValid(file?: Express.Multer.File) {
    if (!file) {
      return false;
    }

    if (!this.validationOptions) {
      return false;
    }

    const metadata = await sharp(file.buffer).metadata();

    if (!metadata.width || !metadata.height) {
      return false;
    }

    return metadata.width === this.validationOptions.maxWidth && metadata.height === this.validationOptions.maxHeight;
  }
}
