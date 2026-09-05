import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  mediaTypeFromMime,
  storePublicMedia,
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

    const mediaType = mediaTypeFromMime(file.type);
    if (!mediaType) {
      return NextResponse.json(
        {
          error:
            "Only JPEG, PNG, WebP, GIF images or MP4, WebM, MOV videos are allowed",
        },
        { status: 400 },
      );
    }

    const maxBytes = mediaType === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error:
            mediaType === "video"
              ? "Video must be 50MB or smaller"
              : "Image must be 5MB or smaller",
        },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = uniqueUploadFileName(file.name, file.type, "gallery");
    const uploaded = await storePublicMedia({
      buffer,
      fileName,
      contentType: file.type,
      folder: "gallery",
      resourceType: mediaType,
    });

    return NextResponse.json({
      url: uploaded.url,
      publicId: uploaded.publicId,
      mediaType,
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unable to upload media.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES };
