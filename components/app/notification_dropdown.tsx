"use client";

import { Bell, CheckCheck, Loader2 } from "lucide-react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/service/notification_service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSocket } from "@/contexts/SocketContext";
import { Notification } from "@/types/notification_type";
import routes from "@/routes/routes";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // Get unread count
  const { data: unreadData } = useQuery({
    queryKey: ["unreadCount"],
    queryFn: getUnreadCount,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get notifications with infinite query
  const {
    data: notificationsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam = 1 }) => getNotifications(pageParam, 10),
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: isOpen,
  });

  // Flatten all notifications from pages
  const allNotifications = useMemo(() => {
    return notificationsData?.pages.flatMap((page) => page.notifications) || [];
  }, [notificationsData]);

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate based on reference type
    if (notification.reference_type === "conversation") {
      router.push(routes.messages);
    } else if (notification.reference_type === "order") {
      // Navigate to orders page (adjust route as needed)
      router.push(routes.orderHistory);
    } else if (notification.reference_type === "listing") {
      // Navigate to manage listings (adjust route as needed)
      router.push(routes.manageListings);
    }

    setIsOpen(false);
  };

  // Load more notifications
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Handle dropdown open/close
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  // Listen for new notifications via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      // Just update the notification count and list, no toast
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      if (isOpen) {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [socket, queryClient, isOpen]);

  const unreadCount = unreadData?.count || 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer">
          <Bell className="size-5 text-zinc-800 hover:text-zinc-400 transition-colors" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-96 max-h-[500px] overflow-y-auto z-[100]"
        align="end"
      >
        <div className="flex items-center justify-between px-2 py-1">
          <DropdownMenuLabel className="text-[16px] font-semibold">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="h-8 gap-1"
            >
              <CheckCheck className="size-4" />
              <span className="text-xs">Mark all read</span>
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-zinc-400" />
          </div>
        ) : allNotifications.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            No notifications yet
          </div>
        ) : (
          <>
            {allNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`px-4 py-1 my-2 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors border-b border-zinc-100 ${
                  !notification.is_read ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex gap-3">
                  {notification.image_url && (
                    <div className="flex-shrink-0 flex items-center justify-center">
                      <Image
                        src={notification.image_url}
                        alt=""
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-zinc-800">
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600 mt-1 line-clamp-2">
                      {notification.content}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString("en-US")}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {hasNextPage && (
              <div className="px-4 py-3 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                  className="w-full"
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Show more"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
