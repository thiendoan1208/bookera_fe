"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useMutation } from "@tanstack/react-query";
import { uploadAvatar, updateName } from "@/service/auth_service";
import { toast } from "sonner";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const { user, refreshUser } = useUser();

  // State for form fields
  const [username, setUsername] = useState(user?.username || "");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Track changes
  const [hasAvatarChanged, setHasAvatarChanged] = useState(false);
  const [hasNameChanged, setHasNameChanged] = useState(false);

  // Error state
  const [nameError, setNameError] = useState<string | null>(null);

  // Mutation for avatar upload
  const uploadAvatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: async () => {
      toast.success("Avatar uploaded successfully!");
      await refreshUser(); // Refresh user context to show new avatar
      setHasAvatarChanged(false);
      setImage(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      // Close dialog if no other changes
      if (!hasNameChanged) {
        onOpenChange(false);
      }
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error && "response" in error
          ? ((error as { response?: { data?: { message?: string } } }).response
              ?.data?.message as string)
          : "Failed to upload avatar";
      toast.error(errorMessage || "Failed to upload avatar");
    },
  });

  // Mutation for name update
  const updateNameMutation = useMutation({
    mutationFn: updateName,
    onSuccess: async () => {
      toast.success("Name updated successfully!");
      await refreshUser(); // Refresh user context to show new name
      setHasNameChanged(false);
      setNameError(null);
      // Close dialog if no other changes
      if (!hasAvatarChanged) {
        onOpenChange(false);
      }
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error && "response" in error
          ? ((error as { response?: { data?: { message?: string } } }).response
              ?.data?.message as string)
          : "Failed to update name";
      setNameError(errorMessage || "Failed to update name");
    },
  });

  const handleSave = async () => {
    let hasChanges = false;

    // Handle avatar update
    if (hasAvatarChanged && image) {
      hasChanges = true;
      const formData = new FormData();
      formData.append("file", image);
      uploadAvatarMutation.mutate(formData);
    }

    // Handle name update
    if (hasNameChanged) {
      if (!(username.trim().length === 0)) {
        hasChanges = true;
        updateNameMutation.mutate(username.trim());
      }
    }

    // If nothing changed
    if (!hasChanges) {
      toast.info("No changes to save");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setHasAvatarChanged(true);

      // Cleanup previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Create new blob URL for preview
      const blobUrl = URL.createObjectURL(file);
      setPreviewUrl(blobUrl);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    setHasNameChanged(newUsername !== user?.username);
    // Clear error when user types
    if (nameError) {
      setNameError(null);
    }
  };

  // Cleanup blob URL when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Reset form when dialog opens
      setUsername(user?.username || "");
      setImage(null);
      setPreviewUrl(null);
      setHasAvatarChanged(false);
      setHasNameChanged(false);
      setNameError(null);
    } else if (previewUrl) {
      // Cleanup when dialog closes
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setImage(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-150 bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Edit profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Photo */}
          <div>
            <label className="text-sm font-semibold mb-3 block">
              Profile photo
            </label>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
                  <Image
                    src={
                      previewUrl ||
                      (user?.avatar_url === "default_avatar"
                        ? "/default_image/default_profile_avatar.jpg"
                        : user?.avatar_url ||
                          "/default_image/default_profile_avatar.jpg")
                    }
                    alt="Profile"
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-white border-2 border-gray-200 rounded-full p-2 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {uploadAvatarMutation.isPending ? (
                    <Loader2 className="w-4 h-4 text-gray-700 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-gray-700" />
                  )}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={uploadAvatarMutation.isPending}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Email</label>
            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-700">
              {user?.email || ""}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Name</label>
            <Input
              onChange={handleUsernameChange}
              value={username}
              className={`w-full ${nameError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              placeholder={user?.username || ""}
              disabled={
                uploadAvatarMutation.isPending || updateNameMutation.isPending
              }
              autoFocus={false}
            />
            {nameError ? (
              <p className="text-xs text-red-500 mt-1">{nameError}</p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">
                Your name can only be changed once every 14 days.
              </p>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6"
            disabled={
              uploadAvatarMutation.isPending || updateNameMutation.isPending
            }
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="px-6 bg-black hover:bg-gray-800 text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              uploadAvatarMutation.isPending || updateNameMutation.isPending
            }
          >
            {uploadAvatarMutation.isPending || updateNameMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
