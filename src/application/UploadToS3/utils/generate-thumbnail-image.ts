import sharp from 'sharp';

export const generateThumbnailImage = (
  imageBuffer: Buffer,
  { width, height } = { width: 32, height: 32 },
  quality = 90,
): Promise<Buffer> => {
  const image = sharp(imageBuffer);

  return image
    .resize({
      width,
      height,
    })
    .toBuffer();
};
