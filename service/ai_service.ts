import { backendInstance } from "@/config/axios";
import {
  GetAIConversationsResponse,
  GetAIMessagesResponse,
  CreateAIConversationResponse,
  SendAIMessageData,
  SendAIMessageResponse,
  DeleteAIConversationResponse,
} from "@/types/ai_type";

/**
 * Get all AI conversations for current user
 */
export const getAIConversations =
  async (): Promise<GetAIConversationsResponse> => {
    try {
      const response = await backendInstance.get("/ai/conversations", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

/**
 * Get messages for a specific AI conversation
 */
export const getAIMessages = async (
  conversationId: number,
): Promise<GetAIMessagesResponse> => {
  try {
    const response = await backendInstance.get(
      `/ai/conversations/${conversationId}/messages`,
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
 * Create a new AI conversation
 */
export const createAIConversation =
  async (): Promise<CreateAIConversationResponse> => {
    try {
      const response = await backendInstance.post(
        "/ai/conversations",
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
 * Send a message to AI
 */
export const sendAIMessage = async (
  data: SendAIMessageData,
): Promise<SendAIMessageResponse> => {
  try {
    const response = await backendInstance.post("/ai/messages", data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete an AI conversation
 */
export const deleteAIConversation = async (
  conversationId: number,
): Promise<DeleteAIConversationResponse> => {
  try {
    const response = await backendInstance.delete(
      `/ai/conversations/${conversationId}`,
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
