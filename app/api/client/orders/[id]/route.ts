import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withAuth } from "@/lib/utils/client/auth-wrapper";
// get single order

export const GET = withAuth(
  async (user, req, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const supabase = await createClient();

      // get order
      const { id: orderId } = await params;

      if (!orderId)
        return NextResponse.json(
          { success: false, error: "Order ID not found" },
          { status: 400 },
        );

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
        .eq("id", orderId)
        .eq("user_id", userId)
        .single();

      if (error)
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 },
        );

      return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message || "Server Error" },
        { status: 500 },
      );
    }
  },
);
