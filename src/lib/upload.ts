import path from "path";
import { v2 as cloudinary } from "cloudinary";

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

function getCloudinaryConfig() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }
  return { cloud_name, api_key, api_secret };
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
  const { buffer, fileName, folder, resourceType = "auto" } = options;
  cloudinary.config(getCloudinaryConfig());

  const publicId = path.parse(fileName).name;

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Cloudinary upload did not return a URL."));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type || resourceType,
        });
      },
    );
    upload.end(buffer);
  });
}

export async function destroyCloudinaryAsset(publicId: string, resourceType: "image" | "video") {
  if (!publicId) return;
  cloudinary.config(getCloudinaryConfig());
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
