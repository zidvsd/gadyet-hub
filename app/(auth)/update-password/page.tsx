"use client";

import { useState, useEffect } from "react";
import { updatePasswordAction } from "../actions";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // Use useRouter for client-side navigation

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { user, loading } = useAuth(); // Using your hook

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client-side protection: Redirect if not logged in after loading finishes
  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please login to access this page.");
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setIsSubmitting(true);
    const result = await updatePasswordAction(password);

    if (result.success) {
      toast.success("Password updated successfully!");
      router.push("/"); // Securely navigate home
    } else {
      toast.error(result.message);
      setIsSubmitting(false);
    }
  };

  // Show nothing or a skeleton while checking auth status
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-sm text-muted-foreground animate-pulse">
          Verifying session...
        </p>
      </div>
    );
  }

  // If loading is done and there's no user, the useEffect will handle the redirect.
  // We return null here to prevent the form from flashing briefly.
  if (!user) return null;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Update Password</CardTitle>
        <CardDescription>Enter your new password below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
