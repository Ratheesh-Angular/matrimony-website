import path from "path";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB

export type UploadFolder = "profiles" | "banners" | "gallery";
export type MediaType = "image" | "video";

export function safeUploadFileName(name: string, fallback: string) {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_");
  return base.slice(0, 100) || fallback;
}

export function extensionFor(mime: string, originalName: string) {
  const fromName = path.extname(originalName).toLowerCase();
  if (fromName && [".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm", ".mov"].includes(fromName)) {
    return fromName === ".jpeg" ? ".jpg" : fromName;
  }
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "video/mp4":
      return ".mp4";
    case "video/webm":
      return ".webm";
    case "video/quicktime":
      return ".mov";
    default:
      return ".bin";
  }
}

export function uniqueUploadFileName(originalName: string, mime: string, fallback: string) {
  const ext = extensionFor(mime, originalName);
  return `${Date.now()}-${safeUploadFileName(path.parse(originalName).name, fallback)}${ext}`;
}

export function mediaTypeFromMime(mime: string): MediaType | null {
  if (ALLOWED_IMAGE_TYPES.has(mime)) return "image";
  if (ALLOWED_VIDEO_TYPES.has(mime)) return "video";
  return null;
}

type R2Config = {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
  endpoint: string;
};

function getR2Config(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
    throw new Error(
      "R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_BASE_URL.",
    );
  }
  const endpoint =
    process.env.R2_ENDPOINT?.replace(/\/$/, "") ||
    `https://${accountId}.r2.cloudflarestorage.com`;
  return { accessKeyId, secretAccessKey, bucket, publicBaseUrl, endpoint };
}

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    const { accessKeyId, secretAccessKey, endpoint } = getR2Config();
    s3Client = new S3Client({
      region: "auto",
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return s3Client;
}

export async function storePublicImage(options: {
  buffer: Buffer;
  fileName: string;
  contentType: string;
  folder: UploadFolder;
}): Promise<string> {
  const result = await storePublicMedia({
    ...options,
    resourceType: "image",
  });
  return result.url;
}

export async function storePublicMedia(options: {
  buffer: Buffer;
  fileName: string;
  contentType: string;
  folder: UploadFolder;
  resourceType?: "image" | "video" | "auto";
}): Promise<{ url: string; publicId: string; resourceType: string }> {
  const { buffer, fileName, contentType, folder, resourceType = "auto" } = options;
  const { bucket, publicBaseUrl } = getR2Config();
  const objectKey = `${folder}/${fileName}`;

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  const resolvedType =
    resourceType === "auto"
      ? (mediaTypeFromMime(contentType) ?? "image")
      : resourceType;

  return {
    url: `${publicBaseUrl}/${objectKey}`,
    publicId: objectKey,
    resourceType: resolvedType,
  };
}

/** Deletes an object from R2 when `objectKey` is a key created by this app. */
export async function destroyStoredMedia(objectKey: string) {
  if (!objectKey) return;
  if (!/^(profiles|banners|gallery)\//.test(objectKey)) {
    return;
  }
  const { bucket } = getR2Config();
  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: objectKey,
    }),
  );
}