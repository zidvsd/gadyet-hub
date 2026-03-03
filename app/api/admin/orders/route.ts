import { supabaseAdmin } from "@/lib/supabase/server-client";
import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/utils/admin/utils";
// get all orders
export async function GET(req: NextRequest) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck) return adminCheck;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    let query = supabaseAdmin.from("orders").select(`*, order_items(
      quantity, price, product_id, product:products(name)
      )`);

    if (userId) {
      query = query.eq("user_id", userId);
    }
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

// create an order
export async function POST(req: NextRequest) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck) return adminCheck;
    const body = await req.json();
    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
