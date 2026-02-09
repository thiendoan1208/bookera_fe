import { backendInstance } from "@/config/axios";
import {
  GetConversationsResponse,
  CreateConversationData,
  CreateConversationResponse,
  GetMessagesResponse,
  SendMessageData,
  SendMessageResponse,
  MarkAsReadResponse,
  DeleteConversationsData,
  DeleteConversationsResponse,
  UploadImageResponse,
} from "@/types/message_type";

/**
 * Get all conversations for current user
 */
export const getConversations = async (): Promise<GetConversationsResponse> => {
  try {
    const response = await backendInstance.get("/messages/conversations", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create or get existing conversation for a listing
 */
export const createConversation = async (
  data: CreateConversationData,
): Promise<CreateConversationResponse> => {
  try {
    const response = await backendInstance.post(
      "/messages/conversations",
      data,
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all messages for a conversation
 */
export const getMessages = async (
  conversationId: number,
): Promise<GetMessagesResponse> => {
  try {
    const response = await backendInstance.get(
      `/messages/conversations/${conversationId}/messages`,
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Send a message in a conversation
 */
export const sendMessage = async (
  conversationId: number,
  data: SendMessageData,
): Promise<SendMessageResponse> => {
  try {
    const response = await backendInstance.post(
      `/messages/conversations/${conversationId}/messages`,
      data,
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (
  conversationId: number,
): Promise<MarkAsReadResponse> => {
  try {
    const response = await backendInstance.patch(
      `/messages/conversations/${conversationId}/read`,
      {},
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark all conversations as read
 */
export const markAllConversationsAsRead =
  async (): Promise<MarkAsReadResponse> => {
    try {
      const response = await backendInstance.patch(
        "/messages/conversations-read-all",
        {},
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

/**
 * Delete conversations
 */
export const deleteConversations = async (
  data: DeleteConversationsData,
): Promise<DeleteConversationsResponse> => {
  try {
    const response = await backendInstance.delete("/messages/conversations", {
      data,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload message image
 */
export const uploadMessageImage = async (
  imageFile: File,
): Promise<UploadImageResponse> => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await backendInstance.post(
      "/messages/upload-image",
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
