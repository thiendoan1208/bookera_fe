export interface AIConversation {
  id: number;
  title: string;
  last_message: string | null;
  last_message_time: string | null;
  created_at: string;
}

export interface AIMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface GetAIConversationsResponse {
  message: string;
  data: AIConversation[];
}

export interface GetAIMessagesResponse {
  message: string;
  data: AIMessage[];
}

export interface CreateAIConversationResponse {
  message: string;
  data: AIConversation;
}

export interface SendAIMessageData {
  conversationId?: number;
  message: string;
}

export interface SendAIMessageResponse {
  message: string;
  data: {
    conversation: {
      id: number;
      title: string;
    };
    message: AIMessage;
  };
}

export interface DeleteAIConversationResponse {
  message: string;
}
