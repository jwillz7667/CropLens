import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const {
  S3_REGION = 'us-east-1',
  S3_BUCKET = process.env.UPLOADS_BUCKET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  STORAGE_PUBLIC_BASE_URL,
} = process.env;

if (!S3_BUCKET) {
  console.warn('S3 bucket missing. Set S3_BUCKET or UPLOADS_BUCKET.');
}

const s3Client = new S3Client({
  region: S3_REGION,
  credentials:
    AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export const createUploadUrl = async (params: { filename: string; contentType?: string; fieldId: string }) => {
  if (!S3_BUCKET) throw new Error('S3 bucket not configured');
  const key = `fields/${params.fieldId}/${Date.now()}-${params.filename}`;
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: params.contentType ?? 'application/octet-stream',
  });
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 15 * 60 });
  return { uploadUrl, fileKey: key };
};

export const buildPublicUrl = (key?: string | null) => {
  if (!key) return null;
  if (STORAGE_PUBLIC_BASE_URL) {
    return `${STORAGE_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`;
  }
  if (!S3_BUCKET) return null;
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
};

export const uploadRaster = async (buffer: Buffer, key: string, contentType = 'image/png') => {
  if (!S3_BUCKET) throw new Error('S3 bucket not configured');
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  await s3Client.send(command);
  return buildPublicUrl(key);
};
