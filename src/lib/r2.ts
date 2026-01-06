import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// R2 client configuration
const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL!;

export type ImageFolder = 'products' | 'recipes' | 'categories' | 'game-types' | 'misc';

/**
 * Generate a unique filename for uploaded images
 */
function generateFilename(originalName: string, folder: ImageFolder): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const sanitizedName = originalName
    .split('.')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 30);

  return `${folder}/${sanitizedName}-${timestamp}-${randomString}.${extension}`;
}

/**
 * Get a presigned URL for uploading a file directly to R2
 */
export async function getPresignedUploadUrl(
  filename: string,
  contentType: string,
  folder: ImageFolder = 'misc'
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const key = generateFilename(filename, folder);

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(R2, command, { expiresIn: 3600 }); // 1 hour
  const publicUrl = `${PUBLIC_URL}/${key}`;

  return { uploadUrl, publicUrl, key };
}

/**
 * Upload a file directly to R2 from the server
 */
export async function uploadToR2(
  file: Buffer,
  filename: string,
  contentType: string,
  folder: ImageFolder = 'misc'
): Promise<{ publicUrl: string; key: string }> {
  const key = generateFilename(filename, folder);

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await R2.send(command);

  const publicUrl = `${PUBLIC_URL}/${key}`;
  return { publicUrl, key };
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await R2.send(command);
}

/**
 * Extract the R2 key from a public URL
 */
export function getKeyFromUrl(url: string): string | null {
  if (!url.startsWith(PUBLIC_URL)) {
    return null;
  }
  return url.replace(`${PUBLIC_URL}/`, '');
}

/**
 * Validate that a file is an allowed image type
 */
export function isValidImageType(contentType: string): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
  ];
  return allowedTypes.includes(contentType);
}

/**
 * Validate file size (default max 10MB)
 */
export function isValidFileSize(sizeInBytes: number, maxSizeMB: number = 10): boolean {
  return sizeInBytes <= maxSizeMB * 1024 * 1024;
}
