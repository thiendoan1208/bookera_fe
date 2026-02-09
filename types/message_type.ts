export interface User {
  id: number;
  username: string;
  avatar_url: string | null;
}

export interface Listing {
  id: number;
  title: string;
  price: number;
}

export interface ListingImage {
  image_url: string;
}

export interface Conversation {
  id: number;
  listing_id: number;
  buyer_id: number;
  seller_id: number;
  last_message: string | null;
  last_message_time: string | null;
  last_sender_id: number | null;
  unread_count?: number;
  created_at: string;
  updated_at: string;
  listing: Listing & {
    images: ListingImage[];
  };
  buyer: User;
  seller: User;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender: User;
}

export interface GetConversationsResponse {
  success: boolean;
  data: Conversation[];
}

export interface CreateConversationData {
  listing_id: number;
}

export interface CreateConversationResponse {
  success: boolean;
  data: Conversation;
}

export interface GetMessagesResponse {
  success: boolean;
  data: Message[];
}

export interface SendMessageData {
  message?: string;
  image_url?: string;
}

export interface SendMessageResponse {
  success: boolean;
  data: Message;
}

export interface UploadImageResponse {
  success: boolean;
  message: string;
  data: {
    image_url: string;
  };
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
}

export interface DeleteConversationsData {
  conversation_ids: number[];
}

export interface DeleteConversationsResponse {
  success: boolean;
  message: string;
  data: {
    deleted: number[];
    hardDeleted: number[];
    errors: Array<{
      conversationId: number;
      message: string;
    }>;
  };
}
