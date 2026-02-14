import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withAuth } from "@/lib/utils/client/auth-wrapper";
export const GET = withAuth(async (user, req) => {
  try {
    const supabase = await createClient();

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id);

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: profileError?.message || "Profile not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: profile }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Server Error" },
      { status: 500 },
    );
  }
});

export const PATCH = withAuth(async (user, req) => {
  try {
    const supabase = await createClient();

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id);

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: profileError?.message || "Profile not found" },
        { status: 404 },
      );
    }
    const body = await req.json();

    const allowedFields = ["first_name", "last_name", "address", "phone"];
    const updates: Record<string, any> = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: true, data: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Server Error" },
      { status: 500 },
    );
  }
});
