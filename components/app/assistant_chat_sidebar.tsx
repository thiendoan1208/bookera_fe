"use client";

import { Menu, Plus, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAIConversations, deleteAIConversation } from "@/service/ai_service";
import { AIConversation } from "@/types/ai_type";
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

interface AssistantChatSidebarProps {
  onNewChat: () => void;
  selectedChatId?: number;
  onSelectChat: (chatId: number) => void;
  onDeleteChat?: (chatId: number) => void;
}

// Format timestamp to relative time
const formatTimestamp = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? "s" : ""} ago`;
};

export default function AssistantChatSidebar({
  onNewChat,
  selectedChatId,
  onSelectChat,
  onDeleteChat,
}: AssistantChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    number | null
  >(null);
  const queryClient = useQueryClient();

  // Fetch AI conversations
  const { data: conversationsData, isLoading } = useQuery({
    queryKey: ["aiConversations"],
    queryFn: getAIConversations,
  });

  const conversations = conversationsData?.data || [];

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: deleteAIConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aiConversations"] });
      if (conversationToDelete === selectedChatId) {
        onDeleteChat?.(conversationToDelete);
      }
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    },
  });

  const handleDeleteClick = (e: React.MouseEvent, chatId: number) => {
    e.stopPropagation();
    setConversationToDelete(chatId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (conversationToDelete) {
      deleteConversationMutation.mutate(conversationToDelete);
    }
  };

  return (
    <>
      {/* Toggle button - hiện khi sidebar đóng */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="mt-10 fixed left-4 top-4 z-50 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all text-zinc-700 hover:text-black"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`pt-10 fixed left-0 top-0 h-full bg-zinc-50 border-r border-zinc-200 transition-all duration-300 z-40 ${
          isOpen ? "w-72" : "w-0"
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-200">
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-700"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={onNewChat}
              className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              New chat
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="text-xs font-semibold text-zinc-500 px-3 py-2">
              Chats
            </div>
            {isLoading ? (
              <div className="text-center py-4 text-zinc-500 text-sm">
                <Loader2 className="animate-spin mx-auto" size={16} />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-4 text-zinc-500 text-sm">
                No conversations yet
              </div>
            ) : (
              conversations.map((chat: AIConversation) => (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`cursor-pointer w-full text-left px-3 py-3 rounded-lg transition-colors group relative ${
                    selectedChatId === chat.id
                      ? "bg-zinc-200 text-black"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {chat.title}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {chat.last_message_time
                          ? formatTimestamp(chat.last_message_time)
                          : "New"}
                      </div>
                    </div>
                    <span
                      onClick={(e) => handleDeleteClick(e, chat.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-zinc-300 rounded transition-all text-zinc-600 hover:text-red-600"
                      title="Delete conversation"
                    >
                      <Trash2 size={14} />
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-200">
            <div className="text-xs text-zinc-600">
              <span className="font-semibold">Kera AI</span>
              <div className="text-zinc-500 mt-1">Your book assistant</div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its
              messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteConversationMutation.isPending}
            >
              {deleteConversationMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
