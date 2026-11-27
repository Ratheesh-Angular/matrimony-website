/**
 * Bulk-migrate gallery media from a local Cloudinary export folder to R2.
 *
 * Matches MongoDB GalleryItem url (res.cloudinary.com .../gallery/<filename>)
 * to files in the export folder by exact filename (case-insensitive),
 * uploads to R2 under gallery/<filename>, and updates both url and publicId.
 *
 * Usage:
 *   npx tsx scripts/migrate-gallery-to-r2.ts
 *   npx tsx scripts/migrate-gallery-to-r2.ts --apply
 *   npx tsx scripts/migrate-gallery-to-r2.ts --dir public/gallery_2026-11-23_18_55
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { connectDB, getDbName } from "../src/lib/db";
import { storePublicMedia } from "../src/lib/upload";
import { GalleryItem } from "../src/models/GalleryItem";

const DEFAULT_DIR = "public/gallery_2026-11-23_18_55";

function parseArgs() {
  const args = process.argv.slice(2);
  let apply = false;
  let dir = DEFAULT_DIR;
  let allUrls = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--apply") apply = true;
    else if (args[i] === "--dir" && args[i + 1]) {
      dir = args[++i];
    } else if (args[i] === "--all") allUrls = true;
  }
  return { apply, dir, allUrls };
}

function cloudinaryFileName(mediaUrl: string): string | null {
  const trimmed = mediaUrl.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    const segments = u.pathname.split("/").filter(Boolean);
    const i = segments.findIndex((s) => s === "gallery");
    if (i >= 0 && segments[i + 1]) {
      return decodeURIComponent(segments[i + 1].split("?")[0]);
    }
  } catch {
    /* fall through */
  }
  const marker = "/gallery/";
  const idx = trimmed.indexOf(marker);
  if (idx >= 0) {
    const tail = trimmed.slice(idx + marker.length).split("?")[0];
    return tail ? decodeURIComponent(tail) : null;
  }
  return null;
}

function isCloudinaryUrl(mediaUrl: string) {
  return /res\.cloudinary\.com/i.test(mediaUrl);
}

function isR2Url(mediaUrl: string, publicBase: string | undefined) {
  if (!mediaUrl) return false;
  if (publicBase && mediaUrl.startsWith(publicBase)) return true;
  return /\.r2\.dev\//i.test(mediaUrl);
}

function buildLocalFileIndex(exportDir: string): Map<string, string> {
  const index = new Map<string, string>();
  const abs = path.resolve(process.cwd(), exportDir);
  if (!fs.existsSync(abs)) {
    throw new Error(`Export folder not found: ${abs}`);
  }
  for (const name of fs.readdirSync(abs)) {
    const full = path.join(abs, name);
    if (!fs.statSync(full).isFile()) continue;
    index.set(name.toLowerCase(), full);
  }
  return index;
}

function mimeFromFileName(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".mov":
      return "video/quicktime";
    default:
      return "application/octet-stream";
  }
}

async function main() {
  const { apply, dir, allUrls } = parseArgs();
  const publicBase = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");

  console.log(`Mode: ${apply ? "APPLY (upload + DB update)" : "DRY RUN"}`);
  console.log(`Database: ${getDbName()}`);
  console.log(`Local folder: ${path.resolve(dir)}`);
  console.log("");

  const fileIndex = buildLocalFileIndex(dir);
  console.log(`Local media files: ${fileIndex.size}`);

  await connectDB();
  const items = await GalleryItem.find(
    { url: { $exists: true, $ne: "" } },
    { mediaType: 1, url: 1, publicId: 1, title: 1 },
  ).lean();

  let skippedR2 = 0;
  let skippedNoCloudinary = 0;
  let matched = 0;
  let missingFile = 0;
  let uploaded = 0;
  let failed = 0;
  const usedFiles = new Set<string>();

  for (const item of items) {
    const id = item._id.toString();
    const mediaUrl = String(item.url || "");
    if (isR2Url(mediaUrl, publicBase)) {
      skippedR2++;
      continue;
    }
    if (!allUrls && !isCloudinaryUrl(mediaUrl)) {
      skippedNoCloudinary++;
      continue;
    }

    const fileName = cloudinaryFileName(mediaUrl);
    if (!fileName) {
      missingFile++;
      console.warn(`[skip] ${id} — cannot parse filename from: ${mediaUrl}`);
      continue;
    }

    const localPath = fileIndex.get(fileName.toLowerCase());
    if (!localPath) {
      missingFile++;
      console.warn(`[missing file] ${id} (${item.title || "untitled"}) needs ${fileName}`);
      continue;
    }

    matched++;
    usedFiles.add(fileName.toLowerCase());

    const mime = mimeFromFileName(fileName);
    const resourceType = item.mediaType === "video" ? "video" : "image";

    if (!apply) {
      console.log(`[dry] ${id} → gallery/${fileName} ← ${path.basename(localPath)}`);
      continue;
    }

    try {
      const buffer = fs.readFileSync(localPath);
      const result = await storePublicMedia({
        buffer,
        fileName,
        contentType: mime,
        folder: "gallery",
        resourceType,
      });
      await GalleryItem.updateOne(
        { _id: item._id },
        { $set: { url: result.url, publicId: result.publicId } },
      );
      uploaded++;
      console.log(`[ok] ${id} → ${result.url}`);
    } catch (err) {
      failed++;
      console.error(`[fail] ${id}:`, err instanceof Error ? err.message : err);
    }
  }

  const unused = [...fileIndex.keys()].filter((k) => !usedFiles.has(k));

  console.log("");
  console.log("--- Summary ---");
  console.log(`Gallery items with url: ${items.length}`);
  console.log(`Already on R2: ${skippedR2}`);
  console.log(`Skipped (non-Cloudinary URL): ${skippedNoCloudinary}`);
  console.log(`Matched local file: ${matched}`);
  console.log(`Missing / unparseable: ${missingFile}`);
  if (apply) {
    console.log(`Uploaded + DB updated: ${uploaded}`);
    console.log(`Failed: ${failed}`);
  } else {
    console.log(`Run with --apply to upload to R2 and update MongoDB.`);
  }
  if (unused.length > 0) {
    console.log(`Unused local files (no matching gallery URL): ${unused.length}`);
    if (unused.length <= 15) {
      unused.forEach((f) => console.log(`  - ${f}`));
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
