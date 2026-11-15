import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/security";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "reviews");

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request as any);
    const limit = checkRateLimit(`review-upload:${ip}`, 10, 60);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many upload attempts. Please wait a moment." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Verify it is an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files (JPEG, PNG, WebP) are permitted." },
        { status: 400 }
      );
    }

    // Max 5MB file size
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image file size exceeds the 5MB limit." },
        { status: 400 }
      );
    }

    // Sanitize file name
    const originalName = file.name || "review-photo.jpg";
    const cleanName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const timestamp = Date.now();
    const fileName = `review-${timestamp}-${cleanName}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Try uploading to Supabase Storage if configured
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(`reviews/${fileName}`, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(`reviews/${fileName}`);

        return NextResponse.json({
          success: true,
          url: publicUrlData.publicUrl,
          fileName,
        });
      }
    }

    // 2. Fallback to local public/uploads/reviews
    ensureUploadDir();
    const filePath = path.join(UPLOAD_DIR, fileName);
    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/reviews/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error) {
    console.error("Review photo upload error:", error);
    return NextResponse.json({ error: "Failed to upload review photo" }, { status: 500 });
  }
}
