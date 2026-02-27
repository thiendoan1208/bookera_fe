export type SavedItemType = "book" | "market_item";

export interface SavedItem {
  id: number;
  user_id: number;
  item_type: SavedItemType;
  work_id: string | null;
  market_item_id: number | null;
  preview_image_url: string | null;
  title: string;
  redirect_url: string;
  created_at: string;
  updated_at: string;
}

export interface SavedItemsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface CreateSavedItemData {
  item_type: SavedItemType;
  work_id?: string;
  market_item_id?: number;
  preview_image_url?: string | null;
  title: string;
  redirect_url: string;
}

export interface CreateSavedItemResponse {
  message: string;
  data: SavedItem;
}

export interface GetSavedItemsResponse {
  message: string;
  data: SavedItem[];
  pagination: SavedItemsPagination;
}

export interface CheckSavedItemData {
  item_type: SavedItemType;
  work_id?: string;
  market_item_id?: number;
}

export interface CheckSavedItemResponse {
  message: string;
  data: {
    saved: boolean;
    item: SavedItem | null;
  };
}

export interface DeleteSavedItemResponse {
  message: string;
  data: {
    deletedId: number;
  };
}
