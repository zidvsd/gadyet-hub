import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,

  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: targetUserId } = await params;
    const supabase = await createClient();

    const {
      data: { user: requester },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !requester) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: roleError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", requester.id)
      .single();

    if (roleError || !profile) {
      return NextResponse.json(
        { error: "Profile/Role not found" },
        { status: 403 },
      );
    }
    const userRole = profile.role;

    const isAdmin = profile.role === "admin";
    const isSelf = requester.id === targetUserId;

    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        {
          error:
            "Access Denied: You cannot view notifications for other users.",
        },
        { status: 403 },
      );
    }
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, role: userRole, data },
      { status: 200 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Server Error" },
      { status: 500 },
    );
  }
}
