"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import Logo from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import routes from "@/routes/routes";
import {
  signIn,
  sendRecoverCode,
  verifyRecoverCode,
  resetPassword,
} from "@/service/auth_service";

interface LoginFormData {
  email: string;
  password: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

function LoginPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useUser();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  // Forgot password states
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"email" | "code" | "reset">("email");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push(routes.home);
    }
  }, [user, loading, router]);

  const signInMutation = useMutation({
    mutationFn: signIn,
    onSuccess: async () => {
      toast.success("Welcome back!");
      await refreshUser(); // Refresh user data in context
      router.push(routes.home);
    },
    onError: () => {
      toast.error("Failed to sign in. Please check your email or password.");
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      signInMutation.mutate({
        email: formData.email,
        password: formData.password,
      });
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleGoogleSignIn = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      signInMutation.mutate({ credential: credentialResponse.credential });
    } else {
      toast.error("Google sign in failed - no credential received");
    }
  };

  // Forgot password handlers
  const handleSendCode = async () => {
    if (!forgotEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setIsLoading(true);
      await sendRecoverCode(forgotEmail);
      toast.success("Recovery code sent to your email");
      setStep("code");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as ApiError).response?.data?.message
          : undefined;
      toast.error(errorMessage || "Failed to send recovery code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!recoveryCode.trim()) {
      toast.error("Please enter the recovery code");
      return;
    }

    try {
      setIsLoading(true);
      await verifyRecoverCode(forgotEmail, recoveryCode);
      toast.success("Code verified successfully");
      setStep("reset");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as ApiError).response?.data?.message
          : undefined;
      toast.error(errorMessage || "Invalid or expired code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      toast.error("Please enter a password");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(forgotEmail, recoveryCode, newPassword);
      toast.success("Password reset successfully. Please sign in.");
      setIsForgotPasswordOpen(false);
      setStep("email");
      setForgotEmail("");
      setRecoveryCode("");
      setNewPassword("");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as ApiError).response?.data?.message
          : undefined;
      toast.error(errorMessage || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForgotPasswordDialog = () => {
    setIsForgotPasswordOpen(false);
    setStep("email");
    setForgotEmail("");
    setRecoveryCode("");
    setNewPassword("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-85">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        {/* Sign in form */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-light text-center mb-6">
            Sign in to Bookera
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="usernameOrEmail"
                className="block text-sm font-medium mb-2"
              >
                Email address
              </label>
              <Input
                id="email"
                type="text"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                aria-invalid={!!errors.email}
                className="w-full"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-xs text-blue-600 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                aria-invalid={!!errors.password}
                className="w-full"
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Sign in button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={signInMutation.isPending}
            >
              {signInMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">or</span>
            </div>
          </div>

          {/* OAuth buttons */}
          <div className="space-y-3">
            <GoogleLogin
              onSuccess={handleGoogleSignIn}
              onError={() => {
                toast.error("Google sign in failed");
              }}
            />
          </div>
        </div>

        {/* Sign up link */}
        <div className="mt-6 text-center border border-border rounded-lg p-4 bg-card">
          <p className="text-sm">
            New to Bookera?{" "}
            <Link
              href={routes.signup}
              className="text-blue-600 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog
        open={isForgotPasswordOpen}
        onOpenChange={(open) => {
          if (step === "reset" && !open) {
            return;
          }
          resetForgotPasswordDialog();
        }}
      >
        <DialogContent className="sm:max-w-112.5 bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              {step === "email" && "Forgot Password"}
              {step === "code" && "Enter Recovery Code"}
              {step === "reset" && "Reset Password"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {step === "email" && (
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Email address
                </label>
                <Input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full"
                  placeholder="Enter your email"
                />
                <p className="text-xs text-gray-500 mt-2">
                  We&apos;ll send a 6-digit recovery code to your email.
                </p>
              </div>
            )}

            {step === "code" && (
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Recovery Code
                </label>
                <Input
                  type="text"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  className="w-full text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the 6-digit code sent to {forgotEmail}
                </p>
              </div>
            )}

            {step === "reset" && (
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  New Password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full"
                  placeholder="Enter new password"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Password must be at least 6 characters.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            {step !== "reset" && (
              <Button
                variant="outline"
                onClick={resetForgotPasswordDialog}
                className="px-6"
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            {step === "email" && (
              <Button
                onClick={handleSendCode}
                className="px-6 bg-black hover:bg-gray-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Code"}
              </Button>
            )}
            {step === "code" && (
              <Button
                onClick={handleVerifyCode}
                className="px-6 bg-black hover:bg-gray-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
            )}
            {step === "reset" && (
              <Button
                onClick={handleResetPassword}
                className="px-6 bg-black hover:bg-gray-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LoginPage;
