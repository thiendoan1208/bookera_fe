export interface CreateListingData {
  title: string;
  author?: string;
  price?: string;
  condition?: string;
  category?: string;
  description?: string;
  images: File[];
}

export interface ListingImage {
  id: number;
  user_book_id: number;
  image_url: string;
}

export interface User {
  id: number;
  username: string;
  avatar_url: string | null;
  createdAt: string;
  email?: string;
  phone_number?: string;
  billing_address?: string;
}

export interface Listing {
  id: number;
  user_id: number;
  title: string;
  author: string | null;
  price: number | null;
  upload_time: string;
  condition: string | null;
  category: string | null;
  description: string | null;
  images: ListingImage[];
  sold?: boolean;
  buyer_id?: number | null;
}

export interface ListingDetail extends Listing {
  user: User;
}

export interface CreateListingResponse {
  message: string;
  data: Listing;
}

export interface GetListingsResponse {
  message: string;
  data: {
    total: number;
    listings: Listing[];
    hasMore: boolean;
  };
}

export interface GetListingResponse {
  message: string;
  data: ListingDetail;
}

export interface CreateCheckoutData {
  listing_id: number;
  success_url: string;
  cancel_url: string;
}

export interface CreateCheckoutResponse {
  message: string;
  data: {
    sessionId: string;
    url: string;
  };
}

export interface VerifyCheckoutSessionResponse {
  valid: boolean;
}

export interface MyListing extends Listing {
  buyer?: User | null;
}

export interface Order {
  id: number;
  listing_id: number;
  buyer_id: number;
  seller_id: number;
  stripe_session_id: string;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  payment_status: string;
  createdAt: string;
  updatedAt: string;
  listing: Listing;
  seller: User;
  buyer: User;
}

export interface GetMyListingsResponse {
  message: string;
  data: MyListing[];
}

export interface GetMyOrdersResponse {
  message: string;
  data: Order[];
  valid: boolean;
  session: VerifyCheckoutSessionResponse | null;
}
