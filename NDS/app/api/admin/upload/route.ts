import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const SESSION_COOKIE_NAME = "nds_admin_session";
const SESSION_SECRET_TOKEN = "nds_atelier_admin_token_v1";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);
    if (session?.value !== SESSION_SECRET_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Verify it is an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files (JPEG, PNG, WebP, etc.) are permitted." },
        { status: 400 }
      );
    }

    // Sanitize file name
    const originalName = file.name || "atelier-image.jpg";
    const cleanName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const timestamp = Date.now();
    const fileName = `upload-${timestamp}-${cleanName}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Try uploading to Supabase Storage if configured
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        return NextResponse.json({
          success: true,
          url: publicUrlData.publicUrl,
          fileName,
        });
      } else {
        console.warn("Supabase storage upload failed, falling back to local:", uploadError);
      }
    }

    // 2. Fallback to local public/uploads (for local development)
    ensureUploadDir();
    const filePath = path.join(UPLOAD_DIR, fileName);
    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }
}
