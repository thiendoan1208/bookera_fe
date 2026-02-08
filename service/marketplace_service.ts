import { backendInstance } from "@/config/axios";
import {
  CreateListingData,
  CreateListingResponse,
  GetListingsResponse,
  GetListingResponse,
  CreateCheckoutData,
  CreateCheckoutResponse,
  VerifyCheckoutSessionResponse,
  GetMyListingsResponse,
  GetMyOrdersResponse,
} from "@/types/marketplace_type";

const createListing = async (
  data: CreateListingData,
): Promise<CreateListingResponse> => {
  try {
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.author) formData.append("author", data.author);
    if (data.price) formData.append("price", data.price);
    if (data.condition) formData.append("condition", data.condition);
    if (data.category) formData.append("category", data.category);
    if (data.description) formData.append("description", data.description);

    data.images.forEach((image) => {
      formData.append("images", image);
    });

    const response = await backendInstance.post(
      "/marketplace/listings",
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

const getListings = async (
  limit: number = 20,
  offset: number = 0,
): Promise<GetListingsResponse> => {
  try {
    const response = await backendInstance.get("/marketplace/listings", {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getListingById = async (id: string): Promise<GetListingResponse> => {
  try {
    const response = await backendInstance.get(`/marketplace/listings/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const createCheckoutSession = async (
  data: CreateCheckoutData,
): Promise<CreateCheckoutResponse> => {
  try {
    const response = await backendInstance.post("/marketplace/checkout", data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const verifyCheckoutSession = async (
  sessionId: string,
): Promise<VerifyCheckoutSessionResponse> => {
  try {
    const response = await backendInstance.get("/marketplace/verify-session", {
      params: { session_id: sessionId },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getMyListings = async (): Promise<GetMyListingsResponse> => {
  try {
    const response = await backendInstance.get("/marketplace/my-listings", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getMyOrders = async (): Promise<GetMyOrdersResponse> => {
  try {
    const response = await backendInstance.get("/marketplace/my-orders", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteListing = async (id: number): Promise<{ message: string }> => {
  try {
    const response = await backendInstance.delete(
      `/marketplace/listings/${id}`,
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export {
  createListing,
  getListings,
  getListingById,
  createCheckoutSession,
  verifyCheckoutSession,
  getMyListings,
  getMyOrders,
  deleteListing,
};
