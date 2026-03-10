"use server";

import { createClient } from "@/lib/supabase/server";
export async function resetPasswordAction(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `https://gadyet-hub.vercel.app/api/auth/confirm?next=/update-password`,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Check your email for the reset link!" };
}

export async function updatePasswordAction(newPassword: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { success: false, message: error.message };
  }
  return { success: true };
}
