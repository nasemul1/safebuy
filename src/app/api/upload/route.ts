import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "@/lib/cloudinary";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json(
      { error: { message: "Not authenticated", code: 401 } },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json(
        { error: { message: "No file provided", code: 400 } },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: { message: "File too large (max 5MB)", code: 400 } },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: { message: "Invalid file type", code: 400 } },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { url } = await uploadToCloudinary(buffer);

    return NextResponse.json({
      data: { url, type: type || "OTHER" },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: { message: "Upload failed", code: 500 } },
      { status: 500 }
    );
  }
}
