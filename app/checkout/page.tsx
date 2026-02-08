"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import routes from "@/routes/routes";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { verifyCheckoutSession } from "@/service/marketplace_service";

function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const payment = searchParams.get("payment");
  const itemId = searchParams.get("item_id");
  const sessionId = searchParams.get("session_id");

  // Verify session with TanStack Query
  const {
    data: verificationData,
    isLoading: verifying,
    isError: verificationFailed,
  } = useQuery({
    queryKey: ["verify-session", sessionId],
    queryFn: () => verifyCheckoutSession(sessionId!),
    enabled: payment === "success" && !!sessionId,
    retry: false,
  });

  useEffect(() => {
    // If no payment status, redirect to marketplace
    if (!payment) {
      router.push(routes.marketplace);
      return;
    }

    // If success but no session_id, redirect to marketplace (unauthorized access)
    if (payment === "success" && !sessionId) {
      router.push(routes.marketplace);
      return;
    }

    // If verification failed or session invalid, redirect after 2 seconds
    if (
      (verificationFailed || (verificationData && !verificationData.valid)) &&
      !verifying
    ) {
      setTimeout(() => {
        router.push(routes.marketplace);
      }, 2000);
    }
  }, [
    payment,
    sessionId,
    router,
    verificationFailed,
    verificationData,
    verifying,
  ]);

  const isSuccess =
    payment === "success" &&
    !verificationFailed &&
    verificationData?.valid !== false;
  const isCancelled = payment === "cancelled";

  if (!payment) {
    return null;
  }

  // Show loading while verifying
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-linear-to-b from-white to-zinc-50">
        <div className="text-center">
          <Loader2 className="size-20 animate-spin text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-600 text-lg">Verifying payment...</p>
        </div>
      </div>
    );
  }

  // Show error if verification failed
  if (verificationFailed || (verificationData && !verificationData.valid)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-linear-to-b from-white to-zinc-50">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-red-100 p-6">
              <XCircle className="size-20 text-red-600" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Invalid Session
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            This payment session is invalid or has expired. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-linear-to-b from-white to-zinc-50">
      <div className="max-w-md w-full">
        {/* Success State */}
        {isSuccess && (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-green-100 p-6">
                <CheckCircle
                  className="size-20 text-green-600"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              Thank you for your purchase. Your order has been confirmed and
              will be processed shortly.
            </p>
            <Button
              onClick={() => router.push(routes.marketplace)}
              className="cursor-pointer w-full rounded-full py-6 text-lg font-semibold bg-black hover:bg-gray-800 transition-colors"
            >
              Back to Marketplace
            </Button>
          </div>
        )}

        {/* Cancelled State */}
        {isCancelled && (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-100 p-6">
                <XCircle className="size-20 text-red-600" strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Payment Cancelled
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              Your payment was not completed. Don&apos;t worry, no charges were
              made to your account.
            </p>
            <div className="flex flex-col gap-3">
              {itemId && (
                <Button
                  onClick={() =>
                    router.push(routes.itemDetail(parseInt(itemId)))
                  }
                  className="cursor-pointer w-full rounded-full py-6 text-lg font-semibold bg-black hover:bg-gray-800 transition-colors"
                >
                  Back to Item
                </Button>
              )}
              <Button
                onClick={() => router.push(routes.marketplace)}
                variant="outline"
                className="cursor-pointer w-full rounded-full py-6 text-lg font-semibold border-2 border-zinc-300 hover:bg-zinc-50 transition-colors"
              >
                Browse Marketplace
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckoutPage;
