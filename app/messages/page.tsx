"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Mock data
const mockConversations = [
  {
    id: 1,
    sender: "ncmcollectibles",
    avatar: "/example.jpg",
    message: "Hey! REDSKINS-61 Just hit 7 Gem!",
    timestamp: "To",
    unread: true,
  },
  {
    id: 2,
    sender: "eBay",
    avatar: "/example.jpg",
    message: "Then, let's finish the draft you started",
    timestamp: "Jan 25",
    unread: false,
  },
  {
    id: 3,
    sender: "eBay",
    avatar: "/example.jpg",
    message:
      'Seller offered a special discount 5% on MSI GE62 7RD 15.6" Apache 16GB Intel i7...',
    timestamp: "Jan 25",
    unread: false,
  },
  {
    id: 4,
    sender: "eBay",
    avatar: "/example.jpg",
    message: "Then, let's finish the draft you started",
    timestamp: "Jan 21",
    unread: false,
  },
  {
    id: 5,
    sender: "eBay",
    avatar: "/example.jpg",
    message:
      "eBay Bid Cancellation Notice - Item 197458896116 - GIGABYTE GeForce RTX 5070...",
    timestamp: "Dec 16",
    unread: false,
  },
  {
    id: 6,
    sender: "eBay",
    avatar: "/example.jpg",
    message: "A new device is using your account",
    timestamp: "Dec 16",
    unread: false,
  },
  {
    id: 7,
    sender: "eBay",
    avatar: "/example.jpg",
    message: "eBay User Agreement update",
    timestamp: "Sep 10",
    unread: false,
  },
];

function MessagePage() {
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);

  const handleSelectMessage = (id: number) => {
    if (selectedMessages.includes(id)) {
      setSelectedMessages(selectedMessages.filter((msgId) => msgId !== id));
    } else {
      setSelectedMessages([...selectedMessages, id]);
    }
  };

  const filteredConversations = mockConversations.filter(
    (conv) =>
      conv.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.message.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar - Messages List */}
      <div className="w-full md:w-96 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold mb-3 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Messages
          </h1>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search all inherited messages"
              className="pl-10 bg-gray-50 border-gray-200 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`flex items-start p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedConversation === conversation.id ? "bg-blue-50" : ""
              }`}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedMessages.includes(conversation.id)}
                onChange={() => handleSelectMessage(conversation.id)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1 mr-3 cursor-pointer"
              />

              {/* Avatar */}
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 mr-3">
                <Image
                  src={conversation.avatar}
                  alt={conversation.sender}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <p
                    className={`text-sm font-semibold truncate ${conversation.unread ? "text-black" : "text-gray-700"}`}
                  >
                    {conversation.sender}
                  </p>
                  <span className="text-xs text-gray-500 ml-2 shrink-0">
                    {conversation.timestamp}
                  </span>
                </div>
                <p
                  className={`text-sm line-clamp-2 ${conversation.unread ? "font-medium text-gray-800" : "text-gray-600"}`}
                >
                  {conversation.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
        <div className="text-center">
          {/* Empty State Illustration */}
          <div className="mb-6">
            <svg
              className="w-64 h-64 mx-auto"
              viewBox="0 0 400 400"
              fill="none"
            >
              {/* Mailbox */}
              <rect
                x="120"
                y="200"
                width="160"
                height="120"
                rx="8"
                fill="#D1D5DB"
              />
              <rect
                x="120"
                y="200"
                width="160"
                height="40"
                rx="8"
                fill="#9CA3AF"
              />
              <rect x="200" y="180" width="20" height="30" fill="#6B7280" />

              {/* Envelope */}
              <path
                d="M140 250 L200 280 L260 250"
                stroke="#4B5563"
                strokeWidth="3"
                fill="none"
              />
              <rect
                x="150"
                y="230"
                width="100"
                height="60"
                rx="4"
                fill="#10B981"
              />
              <path
                d="M150 230 L200 260 L250 230"
                stroke="#059669"
                strokeWidth="2"
                fill="none"
              />

              {/* Person */}
              <circle cx="320" cy="280" r="30" fill="#F59E0B" />
              <ellipse cx="320" cy="340" rx="40" ry="60" fill="#10B981" />
            </svg>
          </div>

          <p className="text-lg font-semibold text-gray-700">
            Select a message to see more.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MessagePage;
