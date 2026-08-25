import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  storePublicImage,
  uniqueUploadFileName,
} from "@/lib/upload";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, or GIF images are allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "File must be 5MB or smaller" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = uniqueUploadFileName(file.name, file.type, "banner");
    const url = await storePublicImage({
      buffer,
      fileName,
      contentType: file.type,
      folder: "banners",
    });

    return NextResponse.json({ url });
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "Unable to upload image.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
