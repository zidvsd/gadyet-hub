import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withAuth } from "@/lib/auth-wrapper";

interface OrderItemPayload {
  product_id: string;
  quantity: number;
  price: number;
}
// get all orders of user
export const GET = withAuth(async (user) => {
  const supabase = await createClient();

  const userId = user.id;

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      total_price,
      status,
      created_at,
      updated_at,
      order_items(
        quantity,
        price,
        product_id,
        product:products(name)
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true, data }, { status: 200 });
});

export const POST = withAuth(async (user, req) => {
  try {
    const supabase = await createClient();
    // 2. Parse and Validate Body
    const body = await req.json();
    const { total_price, order_items } = body;

    if (
      typeof total_price !== "number" ||
      total_price <= 0 ||
      !order_items?.length
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid price or empty order items" },
        { status: 400 },
      );
    }

    // 3. Place Order via RPC (Handles transaction: Order + Items)
    // This replaces all your manual .insert() calls
    const { data: orderResult, error: rpcError } = await supabase.rpc(
      "place_order",
      {
        p_user_id: user.id,
        p_total_price: total_price,
        p_items: order_items,
      },
    );

    if (rpcError) {
      console.error("Database Error:", rpcError.message);
      return NextResponse.json(
        { success: false, error: "Failed to create order" },
        { status: 400 },
      );
    }
    // Handle potential array or single object return from RPC
    const newOrderId = Array.isArray(orderResult)
      ? orderResult[0].id
      : orderResult.id;

    // 4. Fetch the full order with product names for the UI
    const { data: fullOrder, error: fetchError } = await supabase
      .from("orders")
      .select(
        `
        *
        order_items(
          quantity, 
          price, 
          product:products(name, image_url)
        )
      `,
      )
      .eq("id", newOrderId)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(
      { success: true, data: fullOrder },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("ORDER_POST_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server Error" },
      { status: 500 },
    );
  }
});
