"use client";

import { useMemo, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Bookmark, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  deleteSavedItemById,
  getSavedItems,
} from "@/service/saved_item_service";
import { SavedItem, SavedItemType } from "@/types/saved_item_type";

const PAGE_SIZE = 12;

function SavedItemsPage() {
  const [selectedType, setSelectedType] = useState<"all" | SavedItemType>(
    "all",
  );
  const router = useRouter();
  const queryClient = useQueryClient();

  const savedItemsQuery = useInfiniteQuery({
    queryKey: ["saved-items", selectedType],
    queryFn: ({ pageParam = 1 }) =>
      getSavedItems(
        pageParam,
        PAGE_SIZE,
        selectedType === "all" ? undefined : selectedType,
      ),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSavedItemById,
    onSuccess: () => {
      toast.success("Removed from saved list");
      queryClient.invalidateQueries({ queryKey: ["saved-items"] });
      queryClient.invalidateQueries({ queryKey: ["saved-item-check"] });
    },
    onError: (error: Error) => {
      const axiosError = error as Error & {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosError.response?.data?.message || "Failed to remove saved item",
      );
    },
  });

  const savedItems = useMemo(
    () => savedItemsQuery.data?.pages.flatMap((page) => page.data) || [],
    [savedItemsQuery.data],
  );

  const handleOpenItem = (item: SavedItem) => {
    router.push(item.redirect_url);
  };

  const handleDelete = (savedItemId: number) => {
    deleteMutation.mutate(savedItemId);
  };

  const isInitialLoading = savedItemsQuery.isLoading;
  const isEmpty = !isInitialLoading && savedItems.length === 0;

  return (
    <div className="pl-28 pt-18 pr-10 pb-10 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-2">
          <Bookmark className="size-7" />
          Saved
        </h1>
        <p className="text-zinc-500 mt-1">
          Keep your favorite things in one place.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <FilterButton
          active={selectedType === "all"}
          onClick={() => setSelectedType("all")}
          label="All"
        />
        <FilterButton
          active={selectedType === "book"}
          onClick={() => setSelectedType("book")}
          label="Books"
        />
        <FilterButton
          active={selectedType === "market_item"}
          onClick={() => setSelectedType("market_item")}
          label="Marketplace"
        />
      </div>

      {isInitialLoading && <SavedItemsSkeleton />}

      {savedItemsQuery.isError && (
        <div className="py-16 text-center text-zinc-500">
          Failed to load saved items.
        </div>
      )}

      {isEmpty && (
        <div className="py-20 text-center">
          <div className="mx-auto size-20 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
            <Bookmark className="size-9 text-zinc-400" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-800">
            No saved items yet
          </h2>
          <p className="text-zinc-500 mt-2">
            Save books or marketplace items to quickly find them later.
          </p>
        </div>
      )}

      {!isInitialLoading &&
        !savedItemsQuery.isError &&
        savedItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
              {savedItems.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <button
                    className="w-full text-left cursor-pointer"
                    onClick={() => handleOpenItem(item)}
                  >
                    <div className="relative aspect-square bg-zinc-100">
                      {item.preview_image_url ? (
                        <Image
                          src={item.preview_image_url}
                          alt={item.title}
                          fill
                          sizes="100"
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          No image
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-1 text-[11px] font-semibold rounded-full bg-black/70 text-white">
                        {item.item_type === "book" ? "Book" : "Marketplace"}
                      </span>
                    </div>
                  </button>

                  <div className="px-2 py-2">
                    <button
                      className="text-left w-full"
                      onClick={() => handleOpenItem(item)}
                    >
                      <h3 className="font-semibold text-zinc-900 line-clamp-2">
                        {item.title}
                      </h3>
                    </button>

                    <div className="flex items-center justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-zinc-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 flex justify-center">
              {savedItemsQuery.hasNextPage ? (
                <Button
                  variant="outline"
                  onClick={() => savedItemsQuery.fetchNextPage()}
                  disabled={savedItemsQuery.isFetchingNextPage}
                  className="min-w-40 cursor-pointer"
                >
                  {savedItemsQuery.isFetchingNextPage ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              ) : (
                <p className="text-sm text-zinc-500">No more saved items</p>
              )}
            </div>
          </>
        )}
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
        active
          ? "bg-zinc-900 text-white"
          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
      }`}
    >
      {label}
    </button>
  );
}

function SavedItemsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={`saved-skeleton-${index}`}
          className="border border-zinc-200 rounded-2xl overflow-hidden animate-pulse"
        >
          <div className="aspect-square bg-zinc-200" />
          <div className="p-3 space-y-3">
            <div className="h-4 bg-zinc-200 rounded w-4/5" />
            <div className="h-4 bg-zinc-200 rounded w-3/5" />
            <div className="h-3 bg-zinc-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default SavedItemsPage;
