"use client";

import Image from "next/image";
import { Loader2, ShoppingBag, Package, Phone, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getMyOrders } from "@/service/marketplace_service";

function OrderHistoryPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrders,
  });

  const orders = data?.data || [];

  return (
    <div className="pl-28 pt-18 pr-10 pb-10 min-h-screen bg-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order History</h1>
        <p className="text-sm text-zinc-500">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
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
          <ShoppingBag className="size-16 text-zinc-300 mb-4" />
          <p className="text-zinc-500">Failed to load order history</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <ShoppingBag className="size-16 text-zinc-300 mb-4" />
          <p className="text-zinc-500 text-lg mb-2">No orders yet</p>
          <p className="text-zinc-400 text-sm">
            Your purchase history will appear here
          </p>
        </div>
      )}

      {/* Orders list */}
      {!isLoading && !isError && orders.length > 0 && (
        <div className="space-y-0">
          {orders.map((order, index) => (
            <div key={order.id}>
              <div className=" transition-colors py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Item image and info */}
                  <div className="lg:col-span-7">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                        {order.listing.images &&
                        order.listing.images.length > 0 ? (
                          <Image
                            src={order.listing.images[0].image_url}
                            alt={order.listing.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-zinc-400">
                            <Package className="size-10" />
                          </div>
                        )}
                      </div>

                      {/* Item details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                          {order.listing.title}
                        </h3>
                        {order.listing.author && (
                          <p className="text-sm text-zinc-500 mb-2">
                            by {order.listing.author}
                          </p>
                        )}
                        <p className="text-xl font-bold text-gray-800 mb-2">
                          {order.amount.toLocaleString()}{" "}
                          {order.currency.toUpperCase()}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <span>
                            {new Date(order.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                            <div className="size-1.5 bg-green-500 rounded-full" />
                            {order.payment_status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Seller info */}
                  <div className="lg:col-span-5">
                    <div className="bg-zinc-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wide">
                        Seller Information
                      </p>

                      {/* Seller avatar and name */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-200 shrink-0">
                          {order.seller.avatar_url ? (
                            <Image
                              src={order.seller.avatar_url}
                              alt={order.seller.username}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-zinc-500 font-bold text-lg">
                              {order.seller.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-base text-gray-900 truncate">
                            {order.seller.username}
                          </p>
                          {order.seller.email && (
                            <p className="text-xs text-zinc-500 truncate">
                              {order.seller.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Contact info */}
                      <div className="space-y-2">
                        {order.seller.phone_number && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-zinc-500">
                              <Phone className="size-4" />
                            </span>
                            <span className="text-gray-900 font-medium">
                              {order.seller.phone_number}
                            </span>
                          </div>
                        )}
                        {order.seller.billing_address && (
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-zinc-500 mt-0.5">
                              <MapPin className="size-4" />
                            </span>
                            <span className="text-gray-700 flex-1 leading-relaxed">
                              {order.seller.billing_address}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Order ID */}
                      <div className="mt-4 pt-3 border-t border-zinc-200">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500">Order ID</span>
                          <span className="font-mono font-semibold text-gray-700">
                            #{order.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              {index < orders.length - 1 && (
                <div className="border-b border-zinc-200" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistoryPage;
