"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Plus, Store, Package, Loader2, ShoppingBag } from "lucide-react";
import routes from "@/routes/routes";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getListings } from "@/service/marketplace_service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 20;

function MarketplacePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["marketplace-listings"],
    queryFn: ({ pageParam = 0 }) =>
      getListings(ITEMS_PER_PAGE, pageParam * ITEMS_PER_PAGE),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.data.hasMore ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allListings = data?.pages.flatMap((page) => page.data.listings) || [];

  return (
    <div className="pl-28 pt-18 pr-10 pb-10">
      <h1 className="text-3xl font-bold mb-4">Today&apos;s Choice</h1>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="size-8 animate-spin text-zinc-400" />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex justify-center items-center py-20">
          <p className="text-zinc-500">Failed to load listings</p>
        </div>
      )}

      {/* Grid layout for marketplace items */}
      {!isLoading && !isError && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
            {allListings.map((item) => (
              <Link key={item.id} href={routes.itemDetail(item.id)}>
                <Card className="overflow-hidden cursor-pointer shadow-none border-none bg-transparent block group">
                  {/* Image */}
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-100">
                    {item.images && item.images.length > 0 ? (
                      <Image
                        src={item.images[0].image_url}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-zinc-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="pt-2">
                    <p className="text-[17px] text-black line-clamp-2 mb-1">
                      {item.title}
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {item.price === null || item.price === 0
                        ? "MIỄN PHÍ"
                        : `${item.price.toLocaleString()} CA$`}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Load more trigger */}
          <div ref={loadMoreRef} className="py-8 flex justify-center">
            {isFetchingNextPage && (
              <Loader2 className="size-6 animate-spin text-zinc-400" />
            )}
          </div>
        </>
      )}

      {/* FAB - Fixed Action Button with Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <button className="fixed bottom-8 right-8 z-50 size-14 rounded-full bg-white text-black shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110">
            <Plus className="size-7" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Quick Actions
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={() => {
                setDialogOpen(false);
                router.push(routes.sellItem);
              }}
              className="flex items-center gap-4 p-4 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer text-left"
            >
              <div className="size-10 rounded-full bg-white border flex items-center justify-center">
                <Store className="size-5 text-black" />
              </div>
              <div>
                <p className="font-semibold text-base">Sell Item</p>
                <p className="text-sm text-zinc-500">
                  List a new item for sale
                </p>
              </div>
            </button>
            <button
              onClick={() => {
                setDialogOpen(false);
                router.push(routes.manageListings);
              }}
              className="flex items-center gap-4 p-4 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer text-left"
            >
              <div className="size-10 rounded-full bg-white border flex items-center justify-center">
                <Package className="size-5 text-black" />
              </div>
              <div>
                <p className="font-semibold text-base">Manage Listings</p>
                <p className="text-sm text-zinc-500">
                  View and edit your items
                </p>
              </div>
            </button>
            <button
              onClick={() => {
                setDialogOpen(false);
                router.push(routes.orderHistory);
              }}
              className="flex items-center gap-4 p-4 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer text-left"
            >
              <div className="size-10 rounded-full bg-white border flex items-center justify-center">
                <ShoppingBag className="size-5 text-black" />
              </div>
              <div>
                <p className="font-semibold text-base">Order History</p>
                <p className="text-sm text-zinc-500">
                  View your purchases and sales
                </p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MarketplacePage;
