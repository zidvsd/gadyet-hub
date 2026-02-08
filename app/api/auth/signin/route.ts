// app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-client";
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 },
      );
    }

    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exits" },
        { status: 400 },
      );
    }

    const { data: signUpData, error: signUpError } =
      await supabaseAdmin.auth.signUp({
        email,
        password,
      });

    if (signUpError) {
      return NextResponse.json(
        { success: false, error: signUpError.message },
        { status: 400 },
      );
    }

    const userId = signUpData.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Signup failed, user ID not returned" },
        { status: 500 },
      );
    }

    const { error: adminUpdateError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        app_metadata: { role: "user" },
      });

    if (adminUpdateError) {
      console.error("Admin Update Error:", adminUpdateError.message);
    }

    const { error: insertError } = await supabaseAdmin.from("users").upsert(
      {
        id: userId,
        email,
        role: "user",
        first_name: "",
        last_name: "",
      },
      { onConflict: "email" },
    );

    if (insertError)
      return NextResponse.json(
        { success: false, message: "Failed to add user" },
        { status: 400 },
      );

    return NextResponse.json({
      success: true,
      data: { message: "User signed up successfully!" },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Signup failed" },
      { status: 500 },
    );
  }
}
