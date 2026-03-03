import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/server-client";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const isAdmin = searchParams.get("admin") === "true";

    const activeClient = isAdmin ? supabaseAdmin : supabase;

    let queryBuilder = activeClient.from("products").select("*");

    // 1. Apply Search Filter
    if (query) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${query}%,category.ilike.%${query}%`,
      );
    }

    // 2. Apply Visibility Filter (Only if NOT admin)
    if (!isAdmin) {
      queryBuilder = queryBuilder.eq("is_active", true);
    }

    const { data, error } = await queryBuilder.order("created_at", {
      ascending: false,
    });

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
