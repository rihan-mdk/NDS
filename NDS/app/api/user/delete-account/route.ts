import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to request account deletion." },
        { status: 401 }
      );
    }

    const userId = user.id;
    const admin = getSupabaseAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Database administrative service unavailable." },
        { status: 503 }
      );
    }

    // 1. Delete user profile
    await admin.from("profiles").delete().eq("id", userId);

    // 2. Delete saved addresses
    await admin.from("user_addresses").delete().eq("user_id", userId);

    // 3. Clear shopping bag & wishlist records
    try {
      await admin.from("user_cart").delete().eq("user_id", userId);
    } catch {
      // Table may be optional or empty
    }
    try {
      await admin.from("user_wishlist").delete().eq("user_id", userId);
    } catch {
      // Table may be optional or empty
    }

    // 4. Purge customer review photographs from storage and anonymize public reviews
    try {
      const { data: userReviews } = await admin
        .from("product_reviews")
        .select("id, image_url")
        .eq("user_id", userId);

      if (userReviews && userReviews.length > 0) {
        const pathsToDelete: string[] = [];
        for (const rev of userReviews) {
          if (rev.image_url) {
            const match = rev.image_url.match(/product-images\/(reviews\/[^?#]+)/);
            if (match && match[1]) {
              pathsToDelete.push(match[1]);
            }
          }
        }
        if (pathsToDelete.length > 0) {
          try {
            await admin.storage.from("product-images").remove(pathsToDelete);
          } catch (storageErr) {
            console.warn("Could not delete customer review photos from storage:", storageErr);
          }
        }
      }

      await admin
        .from("product_reviews")
        .update({
          user_id: null,
          user_email: null,
          user_name: "Verified Patron",
          image_url: null, // Purge customer photo upon account erasure
        })
        .eq("user_id", userId);
    } catch {
      // Ignore if table does not exist
    }

    // 5. Retain legal & statutory order records as required under Indian commercial regulations,
    // but disassociate the active user account reference.
    try {
      await admin
        .from("orders")
        .update({ user_id: null })
        .eq("user_id", userId);
    } catch {
      // Ignore if update fails
    }

    // 6. Delete authentication record from Supabase Auth
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      console.warn("Could not delete user auth record:", deleteUserError);
    }

    return NextResponse.json({
      success: true,
      message:
        "Your account and personal data (profile, addresses, bag, wishlist) have been deleted. In accordance with statutory tax and commercial record-keeping regulations, previous order invoice numbers and tax ledgers are retained for mandatory legal compliance.",
    });
  } catch (err: any) {
    console.error("Account deletion error:", err);
    return NextResponse.json(
      { error: "Internal error processing account deletion request." },
      { status: 500 }
    );
  }
}
