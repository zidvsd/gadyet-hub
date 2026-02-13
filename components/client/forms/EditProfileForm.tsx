import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { Camera } from "lucide-react";
import { useUsers } from "@/store/useUsers";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { User } from "@/lib/types/users";
import { AvatarImage, Avatar, AvatarFallback } from "@/components/ui/avatar";
export function EditProfileForm({
  user,
  open,
  onOpenChange,
}: {
  user: User;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { fetchUsers } = useUsers();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name ?? "");
      setLastName(user.last_name ?? "");
      setPhoneNumber(user.phone ?? "");
      setAddress(user.address ?? "");
    }
  }, [user]);

  // avatar uploads
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side size check (e.g., 2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/client/user/upload", {
        // Use your upload endpoint
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Upload failed");

      // After successful upload, refresh the user store to show the new image
      await fetchUsers("user", true);
      toast.success("Avatar updated!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };
  // form uploads
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Trim inputs
    const fName = firstName.trim();
    const lName = lastName.trim();
    const phone = phoneNumber.trim();
    const addr = address.trim();

    // Validation
    if (!fName || !/^[a-zA-Z]{2,30}$/.test(fName)) {
      toast.error("First name must be 2-30 letters.");
      setLoading(false);
      return;
    }

    if (!lName || !/^[a-zA-Z]{2,30}$/.test(lName)) {
      toast.error("Last name must be 2-30 letters.");
      setLoading(false);

      return;
    }

    if (phone && !/^\d{7,15}$/.test(phone)) {
      toast.error("Phone number must be 7-15 digits.");
      setLoading(false);

      return;
    }

    if (!/^[a-zA-Z0-9\s,.'#-]{10,}$/.test(addr)) {
      toast.error("Address contains invalid characters.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/client/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone: phoneNumber,
          address: address,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to update profile");
        throw new Error("Failed to update profile");
      }

      await fetchUsers("user", true);

      toast.success("Profile updated successfully!");
      onOpenChange?.(false);
    } catch (err: any) {
      console.error("Profile update error:", err);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!open && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-fit  transition-transform duration-300 hover:scale-105"
          >
            <Settings className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information and avatar{" "}
            </DialogDescription>
          </DialogHeader>
          {/* avatar */}
          <div className="flex self-center w-full items-center justify-center mt-4">
            <div className="w-28 h-28 relative rounded-full border-4 border-accent/20 bg-muted flex items-center justify-center text-accent text-4xl font-bold">
              {user?.avatar_url ? (
                <Image
                  unoptimized
                  src={user.avatar_url}
                  alt={`${user.first_name ?? ""} ${user.last_name ?? ""}`}
                  width={112}
                  height={112}
                  className="object-cover rounded-full w-full h-full"
                />
              ) : (
                <Avatar className="w-full h-full rounded-full">
                  <AvatarImage
                    className="grayscale"
                    src="https://github.com/shadcn.png"
                    alt="morty"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                type="button"
                size="icon"
                variant="accent"
                className="absolute hover-utility hover:scale-110 bottom-1 right-1 h-8 w-8 rounded-full shadow-md"
              >
                {uploading ? (
                  <Spinner className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 " />
                )}
              </Button>
            </div>
          </div>
          <div className="grid gap-4">
            <Field data-disabled>
              <Label htmlFor="input-disabled">Email</Label>
              <Input
                autoComplete="off"
                id="input-disabled"
                type="email"
                placeholder={user.email ?? "Enter your email"}
                disabled
              />
              <FieldDescription>Email cannot be changed.</FieldDescription>
            </Field>
            <div className="grid gap-3">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="off"
                id="firstName"
                placeholder={user.first_name ?? "Enter your first name"}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="off"
                id="lastName"
                placeholder={user.last_name ?? "Enter your last name"}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoComplete="off"
                id="phone-number"
                placeholder={user.phone ?? "Enter your phone number"}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="address">Address</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="off"
                id="address"
                placeholder={user.address ?? "Enter your address"}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" variant="accent" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
