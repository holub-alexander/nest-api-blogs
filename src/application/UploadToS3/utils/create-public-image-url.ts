export const createPublicImageUrl = (folder: string, fileName: string, bucketName: string): string => {
  const encodeFileName = encodeURIComponent(`${folder}/${fileName}`);

  return `https://${bucketName}.s3.amazonaws.com/${encodeFileName}`;
};
