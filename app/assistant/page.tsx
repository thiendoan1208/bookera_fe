"use client";

import { useState, useRef, useEffect } from "react";
import AssistantChatSidebar from "@/components/app/assistant_chat_sidebar";
import { Sparkles, Send } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAIMessages,
  sendAIMessage,
  createAIConversation,
} from "@/service/ai_service";
import { AIMessage } from "@/types/ai_type";
import { useUser } from "@/contexts/UserContext";
import ReactMarkdown from "react-markdown";

// Progressive line-by-line reveal for AI responses
function StreamingMarkdown({
  content,
  shouldAnimate,
  onLineReveal,
  onComplete,
}: {
  content: string;
  shouldAnimate: boolean;
  onLineReveal?: () => void;
  onComplete?: () => void;
}) {
  const [displayedContent, setDisplayedContent] = useState(
    shouldAnimate ? "" : content,
  );
  const [isAnimating, setIsAnimating] = useState(shouldAnimate);
  const onLineRevealRef = useRef(onLineReveal);
  const onCompleteRef = useRef(onComplete);

  onLineRevealRef.current = onLineReveal;
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayedContent(content);
      setIsAnimating(false);
      return;
    }

    const lines = content.split("\n");
    let currentLine = 0;
    setDisplayedContent("");
    setIsAnimating(true);

    const interval = setInterval(() => {
      currentLine++;
      setDisplayedContent(lines.slice(0, currentLine).join("\n"));
      onLineRevealRef.current?.();
      if (currentLine >= lines.length) {
        clearInterval(interval);
        setIsAnimating(false);
        onCompleteRef.current?.();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [content, shouldAnimate]);

  return (
    <>
      <ReactMarkdown>{displayedContent}</ReactMarkdown>
      {isAnimating && (
        <span className="inline-block w-1.5 h-4 bg-zinc-400 animate-pulse ml-0.5 align-text-bottom rounded-sm" />
      )}
    </>
  );
}

function AssistantPage() {
  const [inputValue, setInputValue] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<number | undefined>();
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(
    null,
  );
  const [newAIMessageId, setNewAIMessageId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user } = useUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["aiMessages", selectedChatId],
    queryFn: () => getAIMessages(selectedChatId!),
    enabled: !!selectedChatId,
  });

  const messages = messagesData?.data || [];

  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingUserMessage]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendAIMessage,
    onSuccess: (data) => {
      setPendingUserMessage(null);
      setNewAIMessageId(data.data.message.id);

      // Update messages
      queryClient.invalidateQueries({
        queryKey: ["aiMessages", selectedChatId],
      });
      queryClient.invalidateQueries({ queryKey: ["aiConversations"] });

      // If new conversation, set it as selected
      if (!selectedChatId) {
        setSelectedChatId(data.data.conversation.id);
        // Also fetch messages for the new conversation
        queryClient.invalidateQueries({
          queryKey: ["aiMessages", data.data.conversation.id],
        });
      }
    },
    onError: () => {
      setPendingUserMessage(null);
    },
  });

  // Create new conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: createAIConversation,
    onSuccess: (data) => {
      setSelectedChatId(data.data.id);
      queryClient.invalidateQueries({ queryKey: ["aiConversations"] });
    },
  });

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const message = inputValue;
    setInputValue("");
    setPendingUserMessage(message);

    sendMessageMutation.mutate({
      conversationId: selectedChatId,
      message,
    });
  };

  const handleNewChat = () => {
    setSelectedChatId(undefined);
    setInputValue("");
  };

  const handleSelectChat = (chatId: number) => {
    setSelectedChatId(chatId);
  };

  const handleDeleteChat = (chatId: number) => {
    // If the deleted chat was selected, clear selection
    if (selectedChatId === chatId) {
      setSelectedChatId(undefined);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get user initials for avatar
  const getUserInitial = () => {
    if (!user?.username) return "U";
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-[#F8F8F8] pt-10">
      {/* Chat Sidebar */}
      <AssistantChatSidebar
        onNewChat={handleNewChat}
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col ml-0 transition-all duration-300">
        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 &&
          !isLoadingMessages &&
          !pendingUserMessage &&
          !sendMessageMutation.isPending ? (
            // Welcome Screen
            <div className="h-full flex flex-col items-center justify-center px-4 max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-linear-to-br from-zinc-900 to-zinc-600 rounded-full text-white shadow-lg">
                  <Sparkles size={32} />
                </div>
                <h1 className="text-4xl font-bold text-zinc-800">
                  Hi {user?.username || "there"}
                </h1>
              </div>
              <h2 className="text-2xl text-zinc-600 mb-4">
                How are you feeling today?
              </h2>
              <p className="text-sm text-zinc-500 mb-8 text-center max-w-2xl">
                Tell me your mood or describe a book you&apos;re looking for.
                I&apos;ll help you find the perfect read.
              </p>
            </div>
          ) : (
            // Chat Messages
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
              {isLoadingMessages ? (
                <div className="text-center py-8 text-zinc-500">
                  Loading messages...
                </div>
              ) : (
                messages.map((message: AIMessage) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="shrink-0 mt-1">
                        <div className="w-7 h-7 bg-linear-to-br from-zinc-900 to-zinc-600 rounded-full flex items-center justify-center text-white">
                          <Sparkles size={14} />
                        </div>
                      </div>
                    )}
                    {message.role === "user" ? (
                      <div className="max-w-[70%] px-4 py-3 rounded-2xl bg-zinc-800 text-white">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0 text-zinc-800">
                        <div className="ai-response-content">
                          <StreamingMarkdown
                            content={message.content}
                            shouldAnimate={message.id === newAIMessageId}
                            onLineReveal={scrollToBottom}
                            onComplete={() => setNewAIMessageId(null)}
                          />
                        </div>
                      </div>
                    )}
                    {message.role === "user" && (
                      <div className="shrink-0">
                        {user?.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-zinc-300 rounded-full flex items-center justify-center text-zinc-600 font-semibold text-sm">
                            {getUserInitial()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Optimistic user message */}
              {pendingUserMessage && (
                <div className="flex gap-3 justify-end animate-fade-in">
                  <div className="max-w-[70%] px-4 py-3 rounded-2xl bg-zinc-800 text-white">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {pendingUserMessage}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-zinc-300 rounded-full flex items-center justify-center text-zinc-600 font-semibold text-sm">
                        {getUserInitial()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI loading indicator */}
              {sendMessageMutation.isPending && (
                <div className="flex gap-3 justify-start animate-fade-in">
                  <div className="shrink-0 mt-1">
                    <div className="w-7 h-7 bg-linear-to-br from-zinc-900 to-zinc-600 rounded-full flex items-center justify-center text-white">
                      <Sparkles size={14} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 py-2">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.15s]"></div>
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div>
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-300 rounded-3xl px-4 py-3 focus-within:border-zinc-400 transition-colors">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Tell me how you feel or describe a book..."
                className="flex-1 bg-transparent outline-none resize-none text-zinc-800 placeholder:text-zinc-400 max-h-32"
                rows={1}
                disabled={sendMessageMutation.isPending}
                style={{
                  minHeight: "24px",
                  height: "auto",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = target.scrollHeight + "px";
                }}
              />

              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || sendMessageMutation.isPending}
                className="p-2 bg-zinc-800 text-white rounded-full hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="text-xs text-zinc-500 text-center mt-3">
              Kera can make mistakes. Check important info.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssistantPage;
