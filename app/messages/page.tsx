"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Send,
  Menu,
  X,
  Loader2,
  MessageCircle,
  Package,
  Trash2,
  CheckCheck,
  Paperclip,
  ImageIcon,
  XCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  markAllConversationsAsRead,
  deleteConversations,
  uploadMessageImage,
} from "@/service/message_service";
import { useSocket } from "@/contexts/SocketContext";
import { useUser } from "@/contexts/UserContext";
import { Message } from "@/types/message_type";
import { toast } from "sonner";
import routes from "@/routes/routes";
import { DialogTitle } from "@radix-ui/react-dialog";

function MessagePage() {
  const { user } = useUser();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Helper function to check if avatar URL is valid
  const isValidAvatarUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    if (url === "default_avatar") return false;
    return (
      url.startsWith("/") ||
      url.startsWith("http://") ||
      url.startsWith("https://")
    );
  };

  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [messageInput, setMessageInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState<number[]>(
    [],
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputMessageRef = useRef<HTMLInputElement>(null);

  // Fetch conversations
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    isError: conversationsError,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
    enabled: !!user,
  });

  // Fetch messages for selected conversation
  const {
    data: messagesData,
    isLoading: messagesLoading,
    isError: messagesError,
  } = useQuery({
    queryKey: ["messages", selectedConversationId],
    queryFn: () => getMessages(selectedConversationId!),
    enabled: !!selectedConversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({
      conversationId,
      message,
      image_url,
    }: {
      conversationId: number;
      message?: string;
      image_url?: string;
    }) => sendMessage(conversationId, { message, image_url }),
    onSuccess: () => {
      setMessageInput("");
      setSelectedImage(null);
      setImagePreview(null);

      setTimeout(() => {
        inputMessageRef.current?.focus();
      }, 0);

      queryClient.invalidateQueries({
        queryKey: ["messages", selectedConversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to send message");
      console.error("Send message error:", error);
    },
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: uploadMessageImage,
    onError: (error: Error) => {
      toast.error("Failed to upload image");
      console.error("Upload image error:", error);
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (conversationId: number) => markMessagesAsRead(conversationId),
    onSuccess: () => {
      // Invalidate conversations to update unread count
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Mark all conversations as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllConversationsAsRead,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("All conversations marked as read");
    },
    onError: (error: Error) => {
      toast.error("Failed to mark all as read");
      console.error("Mark all as read error:", error);
    },
  });

  // Delete conversations mutation
  const deleteConversationsMutation = useMutation({
    mutationFn: (conversation_ids: number[]) =>
      deleteConversations({ conversation_ids }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setSelectedConversations([]);

      // If selected conversation was deleted, clear selection
      if (
        selectedConversationId &&
        selectedConversations.includes(selectedConversationId)
      ) {
        setSelectedConversationId(null);
      }

      const deletedCount =
        response.data.deleted.length + response.data.hardDeleted.length;
      toast.success(`Deleted ${deletedCount} conversation(s)`);
    },
    onError: (error: Error) => {
      toast.error("Failed to delete conversations");
      console.error("Delete conversations error:", error);
    },
  });

  const conversations = conversationsData?.data || [];
  const messages = messagesData?.data || [];

  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedConversationId,
  );

  // Socket.IO: Join messages page room to suppress message notifications
  useEffect(() => {
    if (!socket || !user?.id) return;

    socket.emit("join_messages_page", user.id);

    return () => {
      socket.emit("leave_messages_page", user.id);
    };
  }, [socket, user?.id]);

  // Socket.IO: Join all user's conversation rooms
  useEffect(() => {
    if (!socket || !conversations || conversations.length === 0) return;

    // Join all conversation rooms
    conversations.forEach((conv) => {
      socket.emit("join_conversation", conv.id);
    });

    // Cleanup: leave all rooms when component unmounts
    return () => {
      conversations.forEach((conv) => {
        socket.emit("leave_conversation", conv.id);
      });
    };
  }, [socket, conversations]);

  // Socket.IO: Mark as read when selecting a conversation
  useEffect(() => {
    if (selectedConversationId) {
      markAsReadMutation.mutate(selectedConversationId);
      // Focus the input when selecting a conversation
      setTimeout(() => {
        inputMessageRef.current?.focus();
      }, 0);
    }
  }, [selectedConversationId]);

  // Socket.IO: Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      // If message is in current conversation, refetch messages and mark as read
      if (message.conversation_id === selectedConversationId) {
        queryClient.refetchQueries({
          queryKey: ["messages", selectedConversationId],
        });
        // Mark messages as read and refetch conversations
        markMessagesAsRead(selectedConversationId).then(() => {
          queryClient.refetchQueries({ queryKey: ["conversations"] });
        });
      } else {
        // Just refetch conversations to update last message and unread count
        queryClient.refetchQueries({ queryKey: ["conversations"] });
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, selectedConversationId, queryClient]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageInput.trim() && !selectedImage) || !selectedConversationId)
      return;

    let imageUrl: string | undefined;

    // Upload image first if selected
    if (selectedImage) {
      try {
        const uploadResult =
          await uploadImageMutation.mutateAsync(selectedImage);
        imageUrl = uploadResult.data.image_url;
      } catch (error) {
        return; // Error already handled by mutation
      }
    }

    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      message: messageInput.trim() || undefined,
      image_url: imageUrl,
    });
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle conversation selection
  const handleSelectConversation = (conversationId: number) => {
    setSelectedConversationId(conversationId);
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  // Get other user in conversation
  const getOtherUser = (conversation: (typeof conversations)[0]) => {
    return conversation.buyer_id === user?.id
      ? conversation.seller
      : conversation.buyer;
  };

  // Check if two dates are on the same day
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Format date for separator
  const formatDateSeparator = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) {
      return "Today";
    } else if (isSameDay(date, yesterday)) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Mobile sidebar toggle button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-20 left-4 z-50 p-2 bg-white rounded-full shadow-lg border border-gray-200"
      >
        {isSidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Left Sidebar - Conversations List */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } pt-10 md:translate-x-0 fixed md:relative z-40 w-80 md:w-96 h-full border-r border-gray-200 flex flex-col bg-white transition-transform duration-300`}
      >
        {/* Header */}
        <div className="px-4 pb-2 pt-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold flex items-center">
              <MessageCircle className="size-6 mr-2" />
              Messages
            </h1>
          </div>
          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                    className="text-gray-500 hover:text-blue-700 bg-gray-100 hover:bg-blue-100 disabled:opacity-50 border-transparent hover:border-blue-600 disabled:hover:border-transparent not-disabled:hover:cursor-pointer"
                  >
                    {markAllAsReadMutation.isPending ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <CheckCheck className="size-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark all as read</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (selectedConversations.length > 0) {
                        setIsDeleteDialogOpen(true);
                      }
                    }}
                    disabled={selectedConversations.length === 0}
                    className="text-gray-500 hover:text-red-700 bg-gray-100 hover:bg-red-100 disabled:opacity-50 border-transparent hover:border-red-600 disabled:hover:border-transparent not-disabled:hover:cursor-pointer"
                  >
                    <Trash2 className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete selected ({selectedConversations.length})</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversationsLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="size-8 animate-spin text-zinc-400" />
            </div>
          )}

          {conversationsError && (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <MessageCircle className="size-16 text-zinc-300 mb-4" />
              <p className="text-zinc-500 text-center">
                Failed to load conversations
              </p>
            </div>
          )}

          {!conversationsLoading &&
            !conversationsError &&
            conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <MessageCircle className="size-16 text-zinc-300 mb-4" />
                <p className="text-zinc-500 text-center">
                  No conversations yet
                </p>
                <p className="text-zinc-400 text-sm text-center mt-2">
                  Start chatting by contacting a seller from marketplace
                </p>
              </div>
            )}

          {conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            const isSelected = selectedConversationId === conversation.id;
            const isChecked = selectedConversations.includes(conversation.id);
            const hasUnread = (conversation.unread_count ?? 0) > 0;
            const isLastMessageMine = conversation.last_sender_id === user?.id;

            return (
              <div
                key={conversation.id}
                className={`relative flex items-start gap-3 p-4 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  isSelected ? "bg-blue-50" : ""
                }`}
              >
                {/* Checkbox */}
                <div
                  className="pt-1 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedConversations((prev) =>
                      prev.includes(conversation.id)
                        ? prev.filter((id) => id !== conversation.id)
                        : [...prev, conversation.id],
                    );
                  }}
                >
                  <Checkbox checked={isChecked} />
                </div>

                {/* Unread indicator - blue dot */}
                {hasUnread && (
                  <div className="absolute top-2 right-2 size-2.5 bg-blue-500 rounded-full" />
                )}

                {/* Listing Image */}
                <div
                  className="relative size-14 rounded-lg overflow-hidden shrink-0 bg-gray-100"
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  {conversation.listing.images &&
                  conversation.listing.images.length > 0 ? (
                    <Image
                      src={conversation.listing.images[0].image_url}
                      alt={conversation.listing.title}
                      fill
                      sizes="50"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <Package className="size-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div
                  className="flex-1 min-w-0"
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      {/* Other user avatar */}
                      <div className="relative size-6 rounded-full overflow-hidden bg-gray-200">
                        <Image
                          src={
                            isValidAvatarUrl(otherUser.avatar_url)
                              ? otherUser.avatar_url!
                              : "/default_image/default_profile_avatar.jpg"
                          }
                          alt={otherUser.username}
                          fill
                          sizes="50"
                          className="object-cover"
                        />
                      </div>
                      <p className="text-sm font-semibold truncate text-gray-900">
                        {otherUser.username}
                      </p>
                    </div>
                    {conversation.last_message_time && (
                      <span className="text-xs text-gray-500 ml-2 shrink-0">
                        {new Date(
                          conversation.last_message_time,
                        ).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 font-medium truncate mb-1 line-clamp-1">
                    {conversation.listing.title}
                  </p>
                  {conversation.last_message && (
                    <p
                      className={`text-sm line-clamp-1 ${
                        hasUnread
                          ? "font-semibold text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {isLastMessageMine && "You: "}
                      {conversation.last_message}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Right Content Area - Chat */}
      <div className="pt-10 flex-1 flex flex-col bg-white">
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center px-4">
              <MessageCircle className="size-20 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-semibold text-gray-700">
                Select a conversation
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-4 bg-white">
              <div className="flex items-center gap-3">
                {/* Listing Image */}
                <div className="relative size-12 rounded-lg overflow-hidden bg-gray-100">
                  {selectedConversation.listing.images &&
                  selectedConversation.listing.images.length > 0 ? (
                    <Image
                      src={selectedConversation.listing.images[0].image_url}
                      alt={selectedConversation.listing.title}
                      fill
                      sizes="50"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <Package className="size-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2
                    className="font-semibold text-gray-900 truncate cursor-pointer hover:underline"
                    onClick={() =>
                      router.push(
                        routes.itemDetail(selectedConversation.listing.id),
                      )
                    }
                  >
                    {selectedConversation.listing.title}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {/* Show seller info only if user is buyer */}
                    {user?.id === selectedConversation.buyer_id && (
                      <>
                        <div className="relative size-5 rounded-full overflow-hidden bg-gray-200">
                          <Image
                            src={
                              isValidAvatarUrl(
                                getOtherUser(selectedConversation).avatar_url,
                              )
                                ? getOtherUser(selectedConversation).avatar_url!
                                : "/default_image/default_profile_avatar.jpg"
                            }
                            alt={getOtherUser(selectedConversation).username}
                            fill
                            className="object-cover"
                            sizes="50"
                          />
                        </div>
                        <span>
                          {getOtherUser(selectedConversation).username}
                        </span>
                      </>
                    )}
                    {selectedConversation.listing.price !== null &&
                      selectedConversation.listing.price > 0 && (
                        <>
                          {user?.id === selectedConversation.buyer_id && (
                            <span>•</span>
                          )}
                          <span className="font-semibold text-gray-900">
                            {selectedConversation.listing.price.toLocaleString()}{" "}
                            CA$
                          </span>
                        </>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {messagesLoading && (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="size-8 animate-spin text-zinc-400" />
                </div>
              )}

              {messagesError && (
                <div className="flex justify-center items-center py-20">
                  <p className="text-zinc-500">Failed to load messages</p>
                </div>
              )}

              {!messagesLoading &&
                !messagesError &&
                messages.map((message, index) => {
                  const isMine = message.sender_id === user?.id;
                  // Safely parse date
                  const messageDate = message.created_at
                    ? new Date(message.created_at)
                    : new Date();
                  const isValidDate = !isNaN(messageDate.getTime());

                  // Check if we need to show a date separator
                  const prevMessage = index > 0 ? messages[index - 1] : null;
                  const prevMessageDate = prevMessage?.created_at
                    ? new Date(prevMessage.created_at)
                    : null;

                  // Only show separator when there's a previous message AND dates are different
                  const showDateSeparator =
                    index > 0 &&
                    prevMessageDate &&
                    !isSameDay(messageDate, prevMessageDate);

                  return (
                    <div key={message.id}>
                      {/* Date Separator */}
                      {showDateSeparator && isValidDate && (
                        <div className="flex justify-center my-4">
                          <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                            {formatDateSeparator(messageDate)}
                          </div>
                        </div>
                      )}

                      {/* Message */}
                      <div
                        className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {/* Avatar - only show for other user's messages */}
                        {!isMine && (
                          <div className="relative size-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
                            <Image
                              src={
                                isValidAvatarUrl(message.sender.avatar_url)
                                  ? message.sender.avatar_url!
                                  : "/default_image/default_profile_avatar.jpg"
                              }
                              alt={message.sender.username}
                              fill
                              sizes="50"
                              className="object-cover"
                            />
                          </div>
                        )}

                        {/* Message Bubble with Tooltip */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl ${
                                  isMine
                                    ? "bg-black text-white rounded-br-sm"
                                    : "bg-white text-gray-900 rounded-bl-sm border border-gray-200"
                                }`}
                              >
                                {/* Image if present */}
                                {message.image_url && (
                                  <div
                                    className="relative w-full cursor-pointer group"
                                    onClick={() =>
                                      setFullImageUrl(message.image_url!)
                                    }
                                  >
                                    <Image
                                      src={message.image_url}
                                      alt="Message image"
                                      width={400}
                                      height={300}
                                      className="w-full h-auto rounded-t-2xl object-contain group-hover:opacity-90 transition-opacity"
                                      style={{ maxHeight: "400px" }}
                                    />
                                  </div>
                                )}
                                {/* Text message if present */}
                                {message.message && (
                                  <p className="text-sm wrap-break-word px-4 py-2">
                                    {message.message}
                                  </p>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent
                              side={isMine ? "left" : "right"}
                              className="bg-gray-800 text-white text-xs rounded-md px-2 py-1"
                            >
                              <p>
                                {isValidDate
                                  ? messageDate.toLocaleString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "Date unavailable"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  );
                })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4 bg-white">
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-3 relative inline-block">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <XCircle className="size-4" />
                  </button>
                </div>
              )}

              <form
                onSubmit={handleSendMessage}
                className="flex gap-2 items-end"
              >
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* Attach image button */}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={
                    sendMessageMutation.isPending ||
                    uploadImageMutation.isPending
                  }
                  className="shrink-0 text-gray-500 hover:text-gray-700"
                >
                  <Paperclip className="size-5" />
                </Button>

                <Input
                  ref={inputMessageRef}
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1"
                  autoFocus={true}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  disabled={
                    sendMessageMutation.isPending ||
                    uploadImageMutation.isPending
                  }
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={
                    (!messageInput.trim() && !selectedImage) ||
                    sendMessageMutation.isPending ||
                    uploadImageMutation.isPending
                  }
                  className="shrink-0"
                >
                  {sendMessageMutation.isPending ||
                  uploadImageMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversations</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedConversations.length}{" "}
              conversation
              {selectedConversations.length > 1 ? "s" : ""}? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteConversationsMutation.mutate(selectedConversations);
                setIsDeleteDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteConversationsMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Full Image Dialog */}
      <Dialog open={!!fullImageUrl} onOpenChange={() => setFullImageUrl(null)}>
        <DialogTitle></DialogTitle>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
          {fullImageUrl && (
            <div className="relative w-full h-auto">
              <Image
                src={fullImageUrl}
                alt="Full size image"
                width={1200}
                height={800}
                className="w-full h-auto object-contain"
                style={{ maxHeight: "90vh" }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MessagePage;
