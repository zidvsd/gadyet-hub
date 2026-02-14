import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withAuth } from "@/lib/utils/client/auth-wrapper";
export const PATCH = withAuth(async (user, req) => {
  try {
    const { userId } = await req.json();
    const supabase = await createClient();

    if (user.id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: You cannot modify other users' data",
        },
        { status: 403 },
      );
    }

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Server Error" },
      { status: 500 },
    );
  }
});
