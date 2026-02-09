"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, MapPin, ArrowLeft, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { updateBillingInfo } from "@/service/auth_service";
import { useMutation } from "@tanstack/react-query";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "@/app/phone-input.css";

// Firebase imports
import { auth } from "@/config/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

interface BillingAddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "phone" | "otp" | "address";
type Mode = "view" | "edit";

export function BillingAddressDialog({
  open,
  onOpenChange,
}: BillingAddressDialogProps) {
  const { user, refreshUser } = useUser();
  const [mode, setMode] = useState<Mode>("edit");
  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaWidgetId = useRef<number | null>(null);

  // Mutation for updating billing info
  const updateBillingMutation = useMutation({
    mutationFn: updateBillingInfo,
    onSuccess: async () => {
      await refreshUser();
      toast.success("Billing information saved successfully!");
      setMode("view");
      setStep("address");
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error && "response" in error
          ? ((error as { response?: { data?: { message?: string } } }).response
              ?.data?.message as string)
          : "Failed to save billing information";
      toast.error(errorMessage || "Failed to save billing information");
    },
  });

  // Load user data when dialog opens
  useEffect(() => {
    if (open && user) {
      setPhoneNumber(user.phone_number || "");
      setAddress(user.billing_address || "");

      // If user has verified phone and billing address, show view mode
      if (user.phone_verified && user.phone_number && user.billing_address) {
        setMode("view");
        setStep("address");
      } else {
        // Otherwise show edit mode to complete setup
        setMode("edit");
        if (user.phone_verified && user.phone_number) {
          setStep("address");
        } else {
          setStep("phone");
        }
      }
    }
  }, [open, user]);

  // Initialize reCAPTCHA when on phone step
  useEffect(() => {
    if (open && step === "phone" && !recaptchaVerifierRef.current) {
      const timer = setTimeout(() => {
        try {
          const container = document.getElementById("recaptcha-container");
          if (!container) {
            console.error("reCAPTCHA container not found");
            return;
          }

          recaptchaVerifierRef.current = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
              size: "normal",
              "expired-callback": () => {
                toast.error("reCAPTCHA expired. Please solve it again.");
              },
            },
          );

          // Render the widget
          recaptchaVerifierRef.current
            .render()
            .then((widgetId) => {
              recaptchaWidgetId.current = widgetId;
            })
            .catch((error) => {
              console.error("reCAPTCHA render error:", error);
            });
        } catch (error) {
          console.error("reCAPTCHA init error:", error);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [open, step]);

  // Cleanup on close
  useEffect(() => {
    if (!open) {
      // Reset state
      setMode("edit");
      setStep("phone");
      setPhoneNumber("");
      setOtp("");
      setAddress("");
      setConfirmationResult(null);

      // Clear reCAPTCHA
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (error) {
          console.error("Error clearing reCAPTCHA:", error);
        }
        recaptchaVerifierRef.current = null;
        recaptchaWidgetId.current = null;
      }
    }
  }, [open]);

  // Send OTP to phone number
  const sendOTP = async () => {
    if (!phoneNumber || !phoneNumber.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    if (!phoneNumber.startsWith("+")) {
      toast.error("Please select a country code");
      return;
    }

    if (!recaptchaVerifierRef.current) {
      toast.error("Please wait for reCAPTCHA to load...");
      return;
    }

    try {
      setIsLoading(true);

      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifierRef.current,
      );

      setConfirmationResult(confirmation);
      setStep("otp");
      toast.success("OTP sent! Check your phone.");
    } catch (error: unknown) {
      console.error("Send OTP error:", error);

      if (error instanceof Error && "code" in error) {
        const firebaseError = error as { code: string; message: string };
        console.error("Firebase error code:", firebaseError.code);

        let errorMessage = "Failed to send OTP";
        if (firebaseError.code === "auth/invalid-phone-number") {
          errorMessage = "Invalid phone number format";
        } else if (firebaseError.code === "auth/too-many-requests") {
          errorMessage = "Too many requests. Please try again later.";
        } else if (firebaseError.code === "auth/invalid-app-credential") {
          errorMessage =
            "reCAPTCHA verification failed. Please refresh and try again.";
        }

        toast.error(errorMessage);
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }

      // Clear reCAPTCHA on error
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          console.error("Error clearing reCAPTCHA:", e);
        }
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP code
  const verifyOTP = async () => {
    if (!otp || otp.trim().length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    if (!confirmationResult) {
      toast.error("Please request OTP first");
      return;
    }

    try {
      setIsLoading(true);
      await confirmationResult.confirm(otp);
      toast.success("Phone verified successfully!");
      setStep("address");
    } catch (error: unknown) {
      console.error("Verify OTP error:", error);
      toast.error("Invalid OTP code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Update billing info
  const handleUpdate = () => {
    if (!address || !address.trim()) {
      toast.error("Please enter your billing address");
      return;
    }

    updateBillingMutation.mutate({
      phone_number: phoneNumber,
      phone_verified: true,
      billing_address: address,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent
        className="sm:max-w-125 bg-white"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
            {/* Back button for edit mode */}
            {mode === "edit" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (step === "otp") {
                    setStep("phone");
                  } else if (step === "address" || step === "phone") {
                    // If came from view mode (phone already verified), go back to view
                    if (user?.phone_verified && user?.billing_address) {
                      setMode("view");
                    } else {
                      setStep("otp");
                    }
                  }
                }}
                className="h-8 w-8 -ml-2"
              >
                <ArrowLeft className="size-5" />
              </Button>
            )}
            {mode === "view" && "Billing Information"}
            {mode === "edit" && step === "phone" && "Verify Phone Number"}
            {mode === "edit" && step === "otp" && "Enter Verification Code"}
            {mode === "edit" && step === "address" && "Billing Address"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* VIEW MODE: Display Information */}
          {mode === "view" && (
            <>
              <div className="space-y-4">
                {/* Phone Number Display */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="size-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      Phone Number
                    </span>
                    <button
                      onClick={() => {
                        setMode("edit");
                        setStep("phone");
                      }}
                      className="ml-auto text-gray-400 hover:text-gray-700 transition-colors"
                      title="Change phone number"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </div>
                  <p className="text-base font-medium">{phoneNumber}</p>
                  <p className="text-xs text-green-600 mt-1">✓ Verified</p>
                </div>

                {/* Billing Address Display */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="size-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      Billing Address
                    </span>
                    <button
                      onClick={() => {
                        setMode("edit");
                        setStep("address");
                      }}
                      className="ml-auto text-gray-400 hover:text-gray-700 transition-colors"
                      title="Edit address"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </div>
                  <p className="text-base">{address}</p>
                </div>
              </div>
            </>
          )}

          {/* EDIT MODE: Forms */}
          {mode === "edit" && (
            <>
              {/* STEP 1: Phone Number Input */}
              {step === "phone" && (
                <>
                  {/* reCAPTCHA Container */}
                  <div className="flex justify-center py-2">
                    <div id="recaptcha-container" />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 flex items-center">
                      <Phone className="size-4 mr-2" />
                      Phone Number
                    </label>
                    <PhoneInput
                      international
                      defaultCountry="CA"
                      value={phoneNumber}
                      onChange={(value) => setPhoneNumber(value || "")}
                      placeholder="Enter phone number"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      We&apos;ll send you an SMS with a verification code
                    </p>
                  </div>
                </>
              )}

              {/* STEP 2: OTP Verification */}
              {step === "otp" && (
                <>
                  <div>
                    <p className="text-sm text-blue-700">
                      Code sent to <strong>{phoneNumber}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      6-Digit Verification Code
                    </label>
                    <Input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 6) setOtp(value);
                      }}
                      className="w-full text-center text-2xl tracking-widest font-mono"
                      placeholder="000000"
                      maxLength={6}
                      disabled={isLoading}
                      onKeyDown={(e) => e.key === "Enter" && verifyOTP()}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Check your phone for the SMS code
                    </p>
                  </div>
                </>
              )}

              {/* STEP 3: Billing Address */}
              {step === "address" && (
                <>
                  <div>
                    <label className="text-sm font-semibold mb-2 flex items-center">
                      <MapPin className="size-4 mr-2" />
                      Billing Address
                    </label>
                    <Input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full"
                      placeholder="Enter your full address"
                      disabled={isLoading}
                      onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Include street, district, and city
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6"
            disabled={isLoading}
          >
            {mode === "view" ? "Close" : "Cancel"}
          </Button>

          {mode === "edit" && step === "phone" && (
            <Button
              onClick={sendOTP}
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading || !phoneNumber}
            >
              {isLoading ? "Sending..." : "Send Code"}
            </Button>
          )}

          {mode === "edit" && step === "otp" && (
            <Button
              onClick={verifyOTP}
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
          )}

          {mode === "edit" && step === "address" && (
            <Button
              onClick={handleUpdate}
              className="px-6 bg-black hover:bg-gray-800 text-white"
              disabled={updateBillingMutation.isPending || !address}
            >
              {updateBillingMutation.isPending ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
