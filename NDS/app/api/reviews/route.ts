import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ProductReview, calculateReviewStats } from "@/lib/reviews-data";
import { sanitizeText, getClientIp, checkRateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATA_DIR = path.join(process.cwd(), "data");
const REVIEWS_FILE_PATH = path.join(DATA_DIR, "custom-reviews.json");

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(REVIEWS_FILE_PATH)) {
    fs.writeFileSync(REVIEWS_FILE_PATH, JSON.stringify([]), "utf-8");
  }
}

function readReviewsFromFile(): ProductReview[] {
  try {
    ensureDataFile();
    const data = fs.readFileSync(REVIEWS_FILE_PATH, "utf-8");
    return JSON.parse(data || "[]");
  } catch (e) {
    console.error("Error reading custom-reviews.json:", e);
    return [];
  }
}

function writeReviewsToFile(reviews: ProductReview[]) {
  try {
    ensureDataFile();
    fs.writeFileSync(REVIEWS_FILE_PATH, JSON.stringify(reviews, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing custom-reviews.json:", e);
  }
}

// ── GET /api/reviews?slug=<productSlug> OR ?productId=<id> ───────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const productId = searchParams.get("productId");

    if (!slug && !productId) {
      return NextResponse.json({ error: "slug or productId is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    let reviews: ProductReview[] = [];

    // 1. Try reading from Supabase table 'product_reviews' if available
    if (supabase) {
      let query = supabase.from("product_reviews").select("*").order("created_at", { ascending: false });
      if (slug) {
        query = query.eq("product_slug", slug);
      } else if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        reviews = data.map((row) => ({
          id: row.id,
          productId: row.product_id,
          productSlug: row.product_slug,
          orderId: row.order_id,
          userId: row.user_id,
          userName: row.user_name || "Verified Atelier Patron",
          userEmail: row.user_email,
          rating: Number(row.rating),
          comment: row.comment || "",
          imageUrl: row.image_url || null,
          verifiedPurchase: row.verified_purchase !== false,
          createdAt: row.created_at,
        }));
      }
    }

    // 2. Fallback to local JSON file
    if (reviews.length === 0) {
      const fileReviews = readReviewsFromFile();
      reviews = fileReviews.filter((r) =>
        slug ? r.productSlug === slug : r.productId === productId
      );
    }

    const stats = calculateReviewStats(reviews);

    return NextResponse.json({
      reviews,
      stats,
    });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json(
      {
        reviews: [],
        stats: calculateReviewStats([]),
      },
      { status: 200 }
    );
  }
}

// ── POST /api/reviews — Submit verified review ───────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = checkRateLimit(`review:${ip}`, 10, 60); // 10 reviews / minute per IP
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many review attempts. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      productId,
      productSlug,
      orderId,
      userId,
      userName,
      userEmail,
      rating,
      comment,
      imageUrl,
    } = body;

    if (!productId || !productSlug || !orderId || !rating || !comment) {
      return NextResponse.json(
        { error: "Missing required fields: productId, productSlug, orderId, rating, comment" },
        { status: 400 }
      );
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    // Verify order is delivered (if Supabase is configured)
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data: order } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .maybeSingle();

      if (order && order.status !== "Delivered") {
        return NextResponse.json(
          { error: "Reviews can only be submitted for delivered orders." },
          { status: 403 }
        );
      }
    }

    const sanitizedUserName = sanitizeText(String(userName || "Verified Patron")).slice(0, 100);
    const sanitizedComment = sanitizeText(String(comment)).slice(0, 2000);
    const sanitizedImageUrl =
      imageUrl &&
      typeof imageUrl === "string" &&
      (imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://") ||
        imageUrl.startsWith("/uploads/"))
        ? imageUrl
        : null;

    const newReview: ProductReview = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      productId: String(productId),
      productSlug: String(productSlug),
      orderId: String(orderId),
      userId: userId ? String(userId) : undefined,
      userName: sanitizedUserName || "Verified Patron",
      userEmail: userEmail ? String(userEmail) : undefined,
      rating: Math.round(numRating),
      comment: sanitizedComment,
      imageUrl: sanitizedImageUrl,
      verifiedPurchase: true,
      createdAt: new Date().toISOString(),
    };

    // 1. Save to Supabase table 'product_reviews' if configured
    if (supabase) {
      await supabase.from("product_reviews").insert({
        id: newReview.id,
        product_id: newReview.productId,
        product_slug: newReview.productSlug,
        order_id: newReview.orderId,
        user_id: newReview.userId || null,
        user_name: newReview.userName,
        user_email: newReview.userEmail || null,
        rating: newReview.rating,
        comment: newReview.comment,
        image_url: newReview.imageUrl,
        verified_purchase: true,
        created_at: newReview.createdAt,
      });
    }

    // 2. Save to local JSON backup
    const fileReviews = readReviewsFromFile();
    // Prevent duplicate reviews for same order + product
    const filtered = fileReviews.filter(
      (r) => !(r.orderId === newReview.orderId && r.productId === newReview.productId)
    );
    filtered.unshift(newReview);
    writeReviewsToFile(filtered);

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
