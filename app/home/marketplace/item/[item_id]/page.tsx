"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  MessageCircleMore,
  Bookmark,
  Loader2,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getListingById,
  createCheckoutSession,
} from "@/service/marketplace_service";
import { toast } from "sonner";
import routes from "@/routes/routes";
import { useUser } from "@/contexts/UserContext";

function MarketItemPage() {
  const params = useParams();
  const router = useRouter();
  const item_id = params.item_id as string;
  const { user } = useUser();

  const textRef = useRef<HTMLParagraphElement>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isTextClamped, setIsTextClamped] = useState(false);

  const {
    data: listing,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["listing", item_id],
    queryFn: () => getListingById(item_id),
    enabled: !!item_id,
  });

  const product = listing?.data;

  const checkoutMutation = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      // Redirect to Stripe checkout page
      window.location.href = data.data.url;
    },
    onError: (error: Error) => {
      const axiosError = error as Error & {
        response?: { data?: { message?: string } };
      };
      const message =
        axiosError.response?.data?.message ||
        "Failed to create checkout session";
      toast.error(message);
    },
  });

  const handleBuyNow = () => {
    if (!product) return;

    const baseUrl = window.location.origin;
    checkoutMutation.mutate({
      listing_id: product.id,
      success_url: `${baseUrl}${routes.checkout}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${routes.checkout}?payment=cancelled&item_id=${product.id}`,
    });
  };

  // Sync thumbnail border when carousel slides via arrows
  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setSelectedImage(api.selectedScrollSnap());
    };
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Check if description text is clamped
  useEffect(() => {
    if (textRef.current) {
      const el = textRef.current;
      setIsTextClamped(el.scrollHeight > el.clientHeight);
    }
  }, [product?.description]);

  // When clicking thumbnail, scroll carousel to that slide
  const handleThumbnailClick = useCallback(
    (idx: number) => {
      setSelectedImage(idx);
      api?.scrollTo(idx);
    },
    [api],
  );

  return (
    <div className="pl-28 pt-18 pr-10 h-screen">
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="size-8 animate-spin text-zinc-400" />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex justify-center items-center py-20">
          <p className="text-zinc-500">Failed to load listing</p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && product && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          {/* Left - Images */}
          <div className="col-span-1 lg:col-span-6 flex gap-4">
            {/* Thumbnails */}
            <div className="flex flex-col gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => handleThumbnailClick(idx)}
                  className={`relative w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === idx
                      ? "border-black"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <Image
                    src={img.image_url}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image Carousel */}
            <div className="flex-1 min-w-0">
              <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                  {product.images.map((img, idx) => (
                    <CarouselItem key={idx}>
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <Image
                          src={img.image_url}
                          alt={`Product image ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            </div>
          </div>

          {/* Right - Product Info */}
          <div className="col-span-1 lg:col-span-6">
            {/* Title with Save Icon */}
            <div className="flex items-start justify-between gap-3 mb-3 md:mb-4">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 flex-1">
                {product.title}
              </h1>
              <button
                onClick={() => setIsSaved(!isSaved)}
                className="shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Save item"
              >
                <Bookmark
                  className={`w-6 h-6 md:w-7 md:h-7 transition-colors ${
                    isSaved
                      ? "fill-yellow-400 stroke-yellow-400"
                      : "stroke-gray-600 hover:stroke-yellow-400"
                  }`}
                />
              </button>
            </div>

            {/* Seller Info */}
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden bg-zinc-200">
                {product.user?.avatar_url ? (
                  <Image
                    src={product.user.avatar_url}
                    alt={product.user.username}
                    fill
                    className="object-cover"
                    loading="eager"
                    sizes="50px"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-zinc-500 font-bold text-sm">
                    {product.user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm">
                  {product.user?.username}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500">
                  Joined Bookera:{" "}
                  {new Date(product.user?.createdAt || "").getFullYear()}
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="mb-4 md:mb-6">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                {product.price !== null && product.price !== 0
                  ? `${product.price.toLocaleString()} CA$`
                  : "MIỄN PHÍ"}
              </p>
            </div>

            {/* Upload time */}
            <div className="flex items-center mb-3 md:mb-4 text-xs sm:text-sm">
              <span className="text-gray-500 mr-3 md:mr-4">Upload time:</span>
              <span className="font-semibold">
                {new Date(product.upload_time).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Condition */}
            <div className="flex items-center mb-3 md:mb-4 text-xs sm:text-sm">
              <span className="text-gray-500 mr-3 md:mr-4">Condition:</span>
              <span className="font-semibold">{product.condition}</span>
            </div>

            {/* Description */}
            <div className="mb-4 md:mb-6 text-xs sm:text-sm">
              <span className="text-gray-500 mb-2 block">Description:</span>
              <div className="relative">
                <p
                  ref={textRef}
                  className={`whitespace-pre-wrap text-gray-800 leading-relaxed ${
                    !isDescriptionExpanded ? "line-clamp-5" : ""
                  }`}
                >
                  {product.description}
                </p>
                {isLoading == false && isTextClamped && (
                  <button
                    onClick={() =>
                      setIsDescriptionExpanded(!isDescriptionExpanded)
                    }
                    className="text-blue-600 mt-1 font-semibold cursor-pointer text-xs sm:text-sm"
                  >
                    {isDescriptionExpanded ? (
                      <span className="flex items-center justify-center hover:underline">
                        Less <ChevronUp />
                      </span>
                    ) : (
                      <span className="flex items-center justify-center hover:underline">
                        More <ChevronDown />
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 md:gap-3">
              {/* Show "Manage" button if user is the owner */}
              {user && product.user_id === user.id ? (
                <Button
                  className="flex items-center justify-center w-full rounded-full py-4 md:py-6 text-sm sm:text-base md:text-lg font-bold bg-black hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => {
                    router.push(routes.manageListings);
                  }}
                >
                  <Settings className="size-5 md:size-6 mr-2" />
                  Manage
                </Button>
              ) : (
                <>
                  {/* Buy and Contact buttons for non-owners */}
                  <Button
                    className="w-full rounded-full py-4 md:py-6 text-sm sm:text-base md:text-lg font-bold bg-black hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={handleBuyNow}
                    disabled={checkoutMutation.isPending || !product.price}
                  >
                    {checkoutMutation.isPending ? (
                      <>
                        <Loader2 className="size-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Buy It Now"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center w-full rounded-full py-4 md:py-6 text-sm sm:text-base md:text-lg font-semibold text-black border-black hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <MessageCircleMore className="size-5 md:size-6 mr-2" />
                    Contact Seller
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="mt-6 md:mt-10">
        <h1 className="text-xl md:text-2xl font-bold">Similar items</h1>
      </div>
    </div>
  );
}

export default MarketItemPage;
