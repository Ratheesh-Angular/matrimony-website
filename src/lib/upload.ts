import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export type UploadFolder = "profiles" | "banners";

export function safeUploadFileName(name: string, fallback: string) {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_");
  return base.slice(0, 100) || fallback;
}

export function extensionFor(mime: string, originalName: string) {
  const fromName = path.extname(originalName).toLowerCase();
  if (fromName && [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(fromName)) {
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
    default:
      return ".bin";
  }
}

export function uniqueUploadFileName(originalName: string, mime: string, fallback: string) {
  const ext = extensionFor(mime, originalName);
  return `${Date.now()}-${safeUploadFileName(path.parse(originalName).name, fallback)}${ext}`;
}

/** Supports default OIDC vars and prefixed vars from Vercel store connections. */
export function getBlobStoreId() {
  return (
    process.env.BLOB_STORE_ID ||
    process.env.BLOB_READ_WRITE_TOKEN_STORE_ID ||
    undefined
  );
}

function canUploadToVercelBlob() {
  const storeId = getBlobStoreId();
  if (storeId && process.env.VERCEL_OIDC_TOKEN) return true;
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function storePublicImage(options: {
  buffer: Buffer;
  fileName: string;
  contentType: string;
  folder: UploadFolder;
}): Promise<string> {
  const { buffer, fileName, contentType, folder } = options;
  const pathname = `${folder}/${fileName}`;

  if (canUploadToVercelBlob()) {
    const storeId = getBlobStoreId();
    const blob = await put(pathname, buffer, {
      access: "public",
      contentType,
      ...(storeId && process.env.VERCEL_OIDC_TOKEN
        ? { storeId }
        : { token: process.env.BLOB_READ_WRITE_TOKEN }),
    });
    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Vercel Blob is not configured. Connect a public Blob store to this project (OIDC) or set BLOB_READ_WRITE_TOKEN, then redeploy.",
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), buffer);
  return `/uploads/${folder}/${fileName}`;
}
