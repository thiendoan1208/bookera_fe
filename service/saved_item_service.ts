import { backendInstance } from "@/config/axios";
import {
  CheckSavedItemData,
  CheckSavedItemResponse,
  CreateSavedItemData,
  CreateSavedItemResponse,
  DeleteSavedItemResponse,
  GetSavedItemsResponse,
  SavedItemType,
} from "@/types/saved_item_type";

export const createSavedItem = async (
  payload: CreateSavedItemData,
): Promise<CreateSavedItemResponse> => {
  const response = await backendInstance.post("/saved-items", payload, {
    withCredentials: true,
  });
  return response.data;
};

export const getSavedItems = async (
  page: number = 1,
  limit: number = 20,
  itemType?: SavedItemType,
): Promise<GetSavedItemsResponse> => {
  const response = await backendInstance.get("/saved-items", {
    params: {
      page,
      limit,
      item_type: itemType,
    },
    withCredentials: true,
  });
  return response.data;
};

export const checkSavedItem = async (
  params: CheckSavedItemData,
): Promise<CheckSavedItemResponse> => {
  const response = await backendInstance.get("/saved-items/check", {
    params,
    withCredentials: true,
  });
  return response.data;
};

export const deleteSavedItemById = async (
  savedItemId: number,
): Promise<DeleteSavedItemResponse> => {
  const response = await backendInstance.delete(`/saved-items/${savedItemId}`, {
    withCredentials: true,
  });
  return response.data;
};

export const deleteSavedItemByReference = async (
  params: CheckSavedItemData,
): Promise<DeleteSavedItemResponse> => {
  const response = await backendInstance.delete("/saved-items/by-reference", {
    data: params,
    withCredentials: true,
  });
  return response.data;
};
