"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updatePassword, deleteAccount, logout } from "@/service/auth_service";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, clearUser } = useUser();
  const router = useRouter();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If user is Google user (role_id = 2), don't show settings
  if (user?.role_id === 2) {
    return (
      <div className="pl-28 pt-18 pr-10">
        <div>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      await updatePassword(oldPassword, newPassword);
      toast.success("Password updated successfully");
      setIsPasswordDialogOpen(false);
      setOldPassword("");
      setNewPassword("");
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to update password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      await deleteAccount();
      await logout();
      clearUser();
      toast.success("Account deleted successfully");
      setIsDeleteDialogOpen(false);
      router.push("/home");
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to delete account";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pl-28 pt-18 pr-10">
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        {/* Settings Card - All in one */}
        <div>
          <div className="p-6">
            {/* Manage Account Section */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Manage account
              </h2>
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Account control
                </h3>
                <div className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded-md transition-colors">
                  <span className="text-gray-700">Delete account</span>
                  <Button
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-white bg-red-600 hover:bg-red-400 transition-colors font-medium cursor-pointer px-4 py-1 rounded-md"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Privacy
              </h2>
              <div className="border-b border-gray-200 pb-4">
                <div className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded-md transition-colors">
                  <span className="text-gray-700">Update password</span>
                  <Button
                    onClick={() => setIsPasswordDialogOpen(true)}
                    className="text-white bg-black hover:bg-gray-800 transition-colors font-medium cursor-pointer px-4 py-1 rounded-md"
                  >
                    Update
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Password Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent className="sm:max-w-[450px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Update password
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Old password
              </label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full"
                placeholder="Enter old password"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">
                New password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full"
                placeholder="Enter new password"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsPasswordDialogOpen(false);
                setOldPassword("");
                setNewPassword("");
              }}
              className="px-6"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePassword}
              className="px-6 bg-black hover:bg-gray-800 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-red-600">
              Delete Account
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <p className="text-sm text-gray-500">
              All your data will be permanently deleted from our servers.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="px-6"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              className="px-6 bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
