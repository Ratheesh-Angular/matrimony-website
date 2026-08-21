import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

function safeFileName(name: string) {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_");
  return base.slice(0, 100) || "banner";
}

function extensionFor(mime: string, originalName: string) {
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

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, or GIF images are allowed" },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be 5MB or smaller" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extensionFor(file.type, file.name);
  const fileName = `${Date.now()}-${safeFileName(path.parse(file.name).name)}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "banners");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), buffer);

  return NextResponse.json({ url: `/uploads/banners/${fileName}` });
}
