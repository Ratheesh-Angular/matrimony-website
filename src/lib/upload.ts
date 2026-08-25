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

export async function storePublicImage(options: {
  buffer: Buffer;
  fileName: string;
  contentType: string;
  folder: UploadFolder;
}): Promise<string> {
  const { buffer, fileName, contentType, folder } = options;
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    const blob = await put(`${folder}/${fileName}`, buffer, {
      access: "public",
      contentType,
      token,
    });
    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set. Create a Vercel Blob store and add the token to this project's environment variables.",
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), buffer);
  return `/uploads/${folder}/${fileName}`;
}
