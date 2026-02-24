import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withAuth } from "@/lib/utils/client/auth-wrapper";
export const GET = withAuth(
  async (user, req, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const supabase = await createClient();
      const { id: targetUserId } = await params;
      const requester = user;

      const { data: profile, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", requester.id)
        .single();

      if (roleError || !profile) {
        return NextResponse.json(
          { error: "Profile/Role not found" },
          { status: 403 },
        );
      }

      const isAdmin = profile.role === "admin";
      const isSelf = requester.id === targetUserId;

      let query = supabase.from("notifications").select("*");

      if (isAdmin && targetUserId === "all") {
        query = query.in("type", [
          "admin_order_alert",
          "general",
          "order_placed",
        ]);
      } else if (isAdmin || requester.id === targetUserId) {
        query = query.eq("user_id", targetUserId);
      } else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (!isAdmin && !isSelf) {
        return NextResponse.json(
          {
            error:
              "Access Denied: You cannot view notifications for other users.",
          },
          { status: 403 },
        );
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(50);
      return NextResponse.json({ success: true, data });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || "Server Error" },
        { status: 500 },
      );
    }
  },
);
