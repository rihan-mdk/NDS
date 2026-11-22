import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp, timingSafeCompare } from "@/lib/security";
import { verifyAdminFromCookies } from "@/lib/auth-server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    // 1. Enforce strict IP rate limiting on cancellations to prevent brute-force token guessing
    const ip = getClientIp(request as any);
    const limit = checkRateLimit(`cancel-order:${ip}`, 5, 60); // 5 attempts per minute per IP
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many cancellation attempts. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { orderId, cancellationToken } = body;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { error: "Order reference is required." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database service unavailable." },
        { status: 503 }
      );
    }

    // 2. Fetch order details from authoritative storage
    const { data: order, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    // 3. Authorize caller
    let isAdmin = false;
    try {
      const cookieStore = await cookies();
      isAdmin = await verifyAdminFromCookies(cookieStore);
    } catch {
      isAdmin = false;
    }

    if (!isAdmin) {
      if (order.user_id) {
        // Authenticated customer order: caller must be logged in as that exact user
        const supabaseServer = await createClient();
        const { data: { user } } = await supabaseServer.auth.getUser();

        if (!user || user.id !== order.user_id) {
          return NextResponse.json(
            { error: "Unauthorized. You may only cancel orders placed under your account." },
            { status: 403 }
          );
        }
      } else {
        // Guest order: MUST present high-entropy cancellation token matching the stored SHA-256 hash
        if (!cancellationToken || typeof cancellationToken !== "string") {
          return NextResponse.json(
            { error: "Unauthorized. A secure cancellation verification token is required to cancel guest commissions." },
            { status: 403 }
          );
        }

        const providedHash = crypto
          .createHash("sha256")
          .update(cancellationToken.trim())
          .digest("hex");

        if (!order.cancellation_token_hash || !timingSafeCompare(providedHash, order.cancellation_token_hash)) {
          return NextResponse.json(
            { error: "Invalid or expired cancellation verification token." },
            { status: 403 }
          );
        }
      }
    }

    // 4. Verify order status allows cancellation
    if (order.status === "Cancelled") {
      return NextResponse.json(
        { error: "This order has already been cancelled." },
        { status: 400 }
      );
    }

    if (order.status === "Shipped" || order.status === "Delivered") {
      return NextResponse.json(
        {
          error:
            "This order has already been dispatched or delivered. Ordinary cancellations cannot be accepted. Please contact atelier concierge regarding returns or statutory legal remedies.",
        },
        { status: 400 }
      );
    }

    // 5. Verify the strict 24-hour server-side window from creation timestamp
    const createdAt = new Date(order.created_at).getTime();
    const now = Date.now();
    const hoursElapsed = (now - createdAt) / (1000 * 60 * 60);

    if (hoursElapsed > 24) {
      return NextResponse.json(
        {
          error:
            "The 24-hour cancellation grace period has passed. Bespoke fabric cutting and atelier tailoring have commenced. For defective pieces or statutory warranty remedies under applicable law, please contact atelier concierge at neels9589@gmail.com.",
          windowExpired: true,
        },
        { status: 400 }
      );
    }

    // 6. Determine accurate payment and refund state
    // An order is paid only if verified as Paid or if already confirmed by atelier accounts desk
    const isPaid =
      order.payment_status === "Paid" ||
      order.status === "Confirmed" ||
      order.status === "Processing";

    const nextPaymentStatus = isPaid ? "Refund Pending" : "No Refund Due";
    const userMessage = isPaid
      ? "Your order has been cancelled. Your refund is pending accounts desk verification."
      : "Your order has been cancelled. No refund is due because payment was not received.";

    // 7. Update order in Supabase
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "Cancelled",
        payment_status: nextPaymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to record cancellation." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: userMessage,
      status: "Cancelled",
      paymentStatus: nextPaymentStatus,
      refundDue: isPaid,
      orderId,
    });
  } catch (error) {
    console.error("Order cancellation error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing cancellation." },
      { status: 500 }
    );
  }
}
