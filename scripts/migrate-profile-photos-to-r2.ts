/**
 * Bulk-migrate profile photos from a local Cloudinary export folder to R2.
 *
 * Matches MongoDB photoUrl (res.cloudinary.com .../profiles/<filename>)
 * to files in the export folder by exact filename.
 *
 * Usage:
 *   npx tsx scripts/migrate-profile-photos-to-r2.ts
 *   npx tsx scripts/migrate-profile-photos-to-r2.ts --apply
 *   npx tsx scripts/migrate-profile-photos-to-r2.ts --dir profiles_2026-11-23_18_19
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { connectDB, getDbName } from "../src/lib/db";
import { storePublicImage } from "../src/lib/upload";
import { MarriageProfile } from "../src/models/MarriageProfile";

const DEFAULT_DIR = "profiles_2026-11-23_18_19";

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

function cloudinaryFileName(photoUrl: string): string | null {
  const trimmed = photoUrl.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    const segments = u.pathname.split("/").filter(Boolean);
    const i = segments.findIndex((s) => s === "profiles");
    if (i >= 0 && segments[i + 1]) {
      return decodeURIComponent(segments[i + 1].split("?")[0]);
    }
  } catch {
    /* fall through */
  }
  const marker = "/profiles/";
  const idx = trimmed.indexOf(marker);
  if (idx >= 0) {
    const tail = trimmed.slice(idx + marker.length).split("?")[0];
    return tail ? decodeURIComponent(tail) : null;
  }
  return null;
}

function isCloudinaryUrl(photoUrl: string) {
  return /res\.cloudinary\.com/i.test(photoUrl);
}

function isR2Url(photoUrl: string, publicBase: string | undefined) {
  if (!photoUrl) return false;
  if (publicBase && photoUrl.startsWith(publicBase)) return true;
  return /\.r2\.dev\//i.test(photoUrl);
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
  console.log(`Local image files: ${fileIndex.size}`);

  await connectDB();
  const profiles = await MarriageProfile.find(
    { photoUrl: { $exists: true, $ne: "" } },
    { registrationNumber: 1, photoUrl: 1, name: 1 },
  ).lean();

  let skippedR2 = 0;
  let skippedNoCloudinary = 0;
  let matched = 0;
  let missingFile = 0;
  let uploaded = 0;
  let failed = 0;
  const usedFiles = new Set<string>();

  for (const p of profiles) {
    const photoUrl = String(p.photoUrl || "");
    if (isR2Url(photoUrl, publicBase)) {
      skippedR2++;
      continue;
    }
    if (!allUrls && !isCloudinaryUrl(photoUrl)) {
      skippedNoCloudinary++;
      continue;
    }

    const fileName = cloudinaryFileName(photoUrl);
    if (!fileName) {
      missingFile++;
      console.warn(`[skip] ${p.registrationNumber} — cannot parse filename from: ${photoUrl}`);
      continue;
    }

    const localPath = fileIndex.get(fileName.toLowerCase());
    if (!localPath) {
      missingFile++;
      console.warn(`[missing file] ${p.registrationNumber} (${p.name}) needs ${fileName}`);
      continue;
    }

    matched++;
    usedFiles.add(fileName.toLowerCase());

    const mime = mimeFromFileName(fileName);

    if (!apply) {
      console.log(
        `[dry] ${p.registrationNumber} → profiles/${fileName} ← ${path.basename(localPath)}`,
      );
      continue;
    }

    try {
      const buffer = fs.readFileSync(localPath);
      const url = await storePublicImage({
        buffer,
        fileName: fileName,
        contentType: mime,
        folder: "profiles",
      });
      await MarriageProfile.updateOne({ _id: p._id }, { $set: { photoUrl: url } });
      uploaded++;
      console.log(`[ok] ${p.registrationNumber} → ${url}`);
    } catch (err) {
      failed++;
      console.error(
        `[fail] ${p.registrationNumber}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  const unused = [...fileIndex.keys()].filter((k) => !usedFiles.has(k));

  console.log("");
  console.log("--- Summary ---");
  console.log(`Profiles with photoUrl: ${profiles.length}`);
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
    console.log(`Unused local files (no matching profile URL): ${unused.length}`);
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