import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withAuth } from "@/lib/utils/client/auth-wrapper";
export const POST = withAuth(async (user, req) => {
  try {
    const supabase = await createClient();
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    // fetch old avatar to delete

    const { data: userData } = await supabase
      .from("users")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    const oldUrl = userData?.avatar_url;

    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const filePath = `${user.id}/${fileName}`;

    // Convert File to ArrayBuffer then Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload Avatar
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, { upsert: true, contentType: file.type });

    if (uploadError) throw uploadError;

    // Generate signed url
    const { data, error: signedError } = await supabase.storage
      .from("avatars")
      .createSignedUrl(filePath, 31536000);

    if (signedError) throw signedError;

    const finalUrl = data.signedUrl;

    //  Update the Users Table

    const { error: dbError } = await supabase
      .from("users") // Ensure your table name is 'users'
      .update({ avatar_url: finalUrl }) // Update the 'avatar' column
      .eq("id", user.id); // Where the ID matches the current user

    if (dbError) throw dbError;

    // Clean up old avatar logic
    if (oldUrl) {
      try {
        const urlPath = oldUrl.split("?")[0];
        const parts = urlPath.split("/");
        const fileName = parts.pop(); // Get 'photo.jpg'
        const userIdFolder = parts.pop(); // Get 'USER_ID'

        if (fileName && userIdFolder === user.id) {
          const fullPathToDelete = `${userIdFolder}/${fileName}`;

          const { error: removeError } = await supabase.storage
            .from("avatars")
            .remove([fullPathToDelete]);

          if (removeError) console.error("Removal error:", removeError);
        }
      } catch (cleanUpError) {
        console.error("Cleanup logic error:", cleanUpError);
      }
    }
    return NextResponse.json({
      success: true,
      publicUrl: finalUrl,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 },
    );
  }
});
