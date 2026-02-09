"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Loader2,
  Package,
  CheckCircle2,
  Trash2,
  Phone,
  MapPin,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import routes from "@/routes/routes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyListings, deleteListing } from "@/service/marketplace_service";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function ManageListingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "available" | "sold">("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-listings"],
    queryFn: getMyListings,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      toast.success("Listing deleted successfully");
    },
    onError: (error: Error) => {
      const axiosError = error as Error & {
        response?: { data?: { message?: string } };
      };
      const message =
        axiosError.response?.data?.message || "Failed to delete listing";
      toast.error(message);
    },
  });

  const listings = data?.data || [];

  // Filter listings based on selected filter
  const filteredListings = listings.filter((item) => {
    if (filter === "all") return true;
    if (filter === "available") return !item.sold;
    if (filter === "sold") return item.sold;
    return true;
  });

  const availableCount = listings.filter((item) => !item.sold).length;
  const soldCount = listings.filter((item) => item.sold).length;

  const handleDeleteClick = (
    itemId: number,
    itemTitle: string,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setItemToDelete({ id: itemId, title: itemTitle });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="pl-28 pt-18 pr-10 pb-10 min-h-screen bg-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Listings</h1>
        <p className="text-sm text-zinc-500 mb-4">
          {listings.length} total items • {availableCount} available •{" "}
          {soldCount} sold
        </p>

        {/* Filter tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              filter === "all"
                ? "bg-black text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            All ({listings.length})
          </button>
          <button
            onClick={() => setFilter("available")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              filter === "available"
                ? "bg-black text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            Available ({availableCount})
          </button>
          <button
            onClick={() => setFilter("sold")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              filter === "sold"
                ? "bg-black text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            Sold ({soldCount})
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="size-8 animate-spin text-zinc-400" />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20">
          <Package className="size-16 text-zinc-300 mb-4" />
          <p className="text-zinc-500">Failed to load listings</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && filteredListings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Package className="size-16 text-zinc-300 mb-4" />
          <p className="text-zinc-500 mb-6">
            {filter === "all"
              ? "No listings yet"
              : filter === "available"
                ? "No available items"
                : "No sold items"}
          </p>
          {filter === "all" && (
            <Button
              onClick={() => router.push(routes.sellItem)}
              className="rounded-full px-6 cursor-pointer"
            >
              Create Your First Listing
            </Button>
          )}
        </div>
      )}

      {/* List layout */}
      {!isLoading && !isError && filteredListings.length > 0 && (
        <div className="space-y-0">
          {filteredListings.map((item, index) => (
            <div key={item.id}>
              <div className="transition-colors py-6">
                <div className="flex gap-4 items-center">
                  {/* Image */}
                  <div
                    className="relative w-28 h-28 rounded-xl overflow-hidden bg-zinc-100 shrink-0 cursor-pointer"
                    onClick={() => router.push(routes.itemDetail(item.id))}
                  >
                    {item.images && item.images.length > 0 ? (
                      <Image
                        src={item.images[0].image_url}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-zinc-400">
                        <Package className="size-10" />
                      </div>
                    )}
                    {/* Sold badge */}
                    {item.sold && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="size-3" />
                        SOLD
                      </div>
                    )}
                  </div>

                  {/* Item details */}
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <div>
                      <h3
                        onClick={() => router.push(routes.itemDetail(item.id))}
                        className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 hover:underline transition-all cursor-pointer"
                      >
                        {item.title}
                      </h3>
                      {item.author && (
                        <p className="text-sm text-zinc-500 mb-2">
                          by {item.author}
                        </p>
                      )}
                      <p className="text-xl font-bold text-gray-800 mb-2">
                        {item.price === null || item.price === 0
                          ? "MIỄN PHÍ"
                          : `${item.price.toLocaleString()} CA$`}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>
                          {new Date(item.upload_time).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                        {item.condition && (
                          <>
                            <span>•</span>
                            <span>{item.condition}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Buyer info if sold */}
                    {item.sold && item.buyer && (
                      <div className="mt-3 bg-zinc-50 rounded-lg p-3 inline-block">
                        <p className="text-xs text-zinc-500 mb-2">Sold to:</p>
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-200 shrink-0">
                            {item.buyer.avatar_url ? (
                              <Image
                                src={item.buyer.avatar_url}
                                alt={item.buyer.username}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full text-zinc-500 font-bold text-xs">
                                {item.buyer.username?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">
                              {item.buyer.username}
                            </p>
                            {item.buyer.phone_number && (
                              <p className="text-xs text-zinc-500 flex items-center gap-1">
                                <Phone className="size-3" />
                                {item.buyer.phone_number}
                              </p>
                            )}
                            {item.buyer.billing_address && (
                              <p className="text-xs text-zinc-500 flex items-center gap-1">
                                <MapPin className="size-3" />
                                {item.buyer.billing_address}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {!item.sold && (
                    <div className="h-full shrink-0">
                      <button
                        onClick={(e) =>
                          handleDeleteClick(item.id, item.title, e)
                        }
                        disabled={deleteMutation.isPending}
                        className="p-2 hover:bg-red-50 rounded-full transition-colors group cursor-pointer disabled:opacity-50"
                        title="Delete listing"
                      >
                        <Trash2 className="size-5 text-zinc-400 group-hover:text-red-600 transition-colors" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              {index < filteredListings.length - 1 && (
                <div className="border-b border-zinc-200" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{itemToDelete?.title}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ManageListingsPage;
