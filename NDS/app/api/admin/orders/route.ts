import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminFromCookies } from "@/lib/auth-server";
import { sanitizeText } from "@/lib/security";

async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    return verifyAdminFromCookies(cookieStore);
  } catch {
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbOrderToRecord(order: any, items: any[] = []) {
  return {
    id: order.id,
    date: new Date(order.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: order.status,
    total: Number(order.total),
    shippingAddress: `${order.customer_name}, ${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}`,
    paymentMethod: order.payment_method,
    customer: {
      name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      address: order.shipping_address,
      city: order.shipping_city,
      state: order.shipping_state,
      pincode: order.shipping_pincode,
    },
    items: items.map((item) => ({
      product: {
        id: item.product_id,
        title: item.product_title,
        price: Number(item.unit_price),
        images: item.product_image ? [item.product_image] : [],
      },
      quantity: item.quantity,
      selectedSize: item.size || "",
    })),
  };
}

// ── GET ──────────────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  // If requesting the full orders list (not for a specific user), admin authentication is strictly required
  if (!userId) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized atelier administrator access required." },
        { status: 401 }
      );
    }
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ orders: [] }, { status: 200 });
  }

  try {
    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: ordersData, error: ordersError } = await query;

    if (ordersError || !ordersData || ordersData.length === 0) {
      if (ordersError) console.error("Error fetching orders:", ordersError);
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    const orderIds = ordersData.map((o) => o.id);
    const { data: itemsData, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds);

    if (itemsError) {
      console.warn("Could not fetch order items:", itemsError);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemsByOrderId: Record<string, any[]> = {};
    for (const item of itemsData || []) {
      if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
      itemsByOrderId[item.order_id].push(item);
    }

    const orders = ordersData.map((order) =>
      dbOrderToRecord(order, itemsByOrderId[order.id] || [])
    );

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("GET /api/admin/orders error:", err);
    return NextResponse.json({ orders: [] }, { status: 200 });
  }
}

// ── POST ─────────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Supabase not configured — checkout still succeeds via localStorage
    return NextResponse.json({ success: true, fallback: true }, { status: 200 });
  }

  try {
    const body = await request.json();
    const {
      id,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPincode,
      paymentMethod,
      total,
      giftPackaging,
      giftMessage,
      items,
    } = body;

    if (!id || !total) {
      return NextResponse.json(
        { error: "Missing required order fields" },
        { status: 400 }
      );
    }

    const { error: orderError } = await supabase.from("orders").insert({
      id,
      user_id: userId || null,
      customer_name: customerName || null,
      customer_email: customerEmail || null,
      customer_phone: customerPhone || null,
      shipping_address: shippingAddress || null,
      shipping_city: shippingCity || null,
      shipping_state: shippingState || null,
      shipping_pincode: shippingPincode || null,
      payment_method: paymentMethod || "UPI",
      status: "Confirmed",
      total: Number(total),
      gift_packaging: giftPackaging || false,
      gift_message: giftMessage || null,
    });

    if (orderError) {
      console.error("Error inserting order:", orderError);
      return NextResponse.json(
        { error: "Failed to save order" },
        { status: 500 }
      );
    }

    if (Array.isArray(items) && items.length > 0) {
      const itemRows = items.map((item) => ({
        order_id: id,
        product_id: item.productId || null,
        product_title: item.productTitle || null,
        product_image: item.productImage || null,
        size: item.size || null,
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unitPrice) || 0,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemRows);

      if (itemsError) {
        console.warn("Could not save order items:", itemsError);
      }
    }

    return NextResponse.json({ success: true, orderId: id }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/orders error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── PUT ──────────────────────────────────────────────────────────────────────
export async function PUT(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ success: true, fallback: true }, { status: 200 });
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing id or status" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error updating order status:", error);
      return NextResponse.json(
        { error: "Failed to update status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/admin/orders error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
