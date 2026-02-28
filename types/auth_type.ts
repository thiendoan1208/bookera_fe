export interface SignUpResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface SignInResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    avatar_url?: string;
    phone_number?: string;
    phone_verified?: boolean;
    billing_address?: string;
  };
}

export interface SignUpData {
  username: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface GoogleSignUpData {
  credential: string;
}

export interface GoogleSignInData {
  credential: string;
}

export interface UpdateBillingInfoData {
  phone_number?: string;
  phone_verified?: boolean;
  billing_address?: string;
  firebase_id_token?: string;
}

export interface UpdateBillingInfoResponse {
  message: string;
  data: {
    phone_number: string;
    phone_verified: boolean;
    billing_address: string;
  };
}
