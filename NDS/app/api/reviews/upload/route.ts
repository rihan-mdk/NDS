import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/security";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "reviews");

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Enforce IP rate limiting (10 attempts per minute per IP)
    const ip = getClientIp(request as any);
    const limit = checkRateLimit(`review-upload:${ip}`, 10, 60);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many upload attempts. Please wait a moment." },
        { status: 429 }
      );
    }

    // 2. Strict Authentication: Must be a logged-in patron
    const supabaseServer = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required to upload review photographs." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const orderId = (formData.get("orderId") as string | null)?.trim();
    const productId = (formData.get("productId") as string | null)?.trim();

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // 3. Eligibility Verification: Order must exist, belong to user, and be Delivered
    if (!orderId) {
      return NextResponse.json(
        { error: "Order reference is required to verify review photograph eligibility." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .select("id, user_id, status")
        .eq("id", orderId)
        .maybeSingle();

      if (orderError || !order) {
        return NextResponse.json(
          { error: "Order reference not found." },
          { status: 404 }
        );
      }

      if (order.user_id && order.user_id !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized. You may only upload photographs for commissions placed under your account." },
          { status: 403 }
        );
      }

      if (order.status !== "Delivered") {
        return NextResponse.json(
          { error: "Photographs may only be submitted for delivered bespoke creations." },
          { status: 403 }
        );
      }
    }

    // 4. File MIME type verification
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files (JPEG, PNG, WebP) are permitted." },
        { status: 400 }
      );
    }

    // 5. File size restriction (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image file size exceeds the 5MB limit." },
        { status: 400 }
      );
    }

    // 6. Filename sanitization
    const originalName = file.name || "review-photo.jpg";
    const cleanName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const timestamp = Date.now();
    const fileName = `review-${timestamp}-${cleanName}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 7. Store in Supabase Storage bucket 'product-images/reviews/'
    if (supabaseAdmin) {
      const { error: uploadError } = await supabaseAdmin.storage
        .from("product-images")
        .upload(`reviews/${fileName}`, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from("product-images")
          .getPublicUrl(`reviews/${fileName}`);

        return NextResponse.json({
          success: true,
          url: publicUrlData.publicUrl,
          fileName,
        });
      }
    }

    // Fallback to local uploads directory
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
