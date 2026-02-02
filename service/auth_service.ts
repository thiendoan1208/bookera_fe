import { backendInstance } from "@/config/axios";
import {
  SignUpResponse,
  SignInResponse,
  SignUpData,
  SignInData,
  GoogleSignUpData,
  GoogleSignInData,
} from "@/types/auth_type";

const signUp = async (
  userData: SignUpData | GoogleSignUpData,
): Promise<SignUpResponse> => {
  try {
    const response = await backendInstance.post("/auth/sign_up", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const signIn = async (
  loginData: SignInData | GoogleSignInData,
): Promise<SignInResponse> => {
  try {
    const response = await backendInstance.post("/auth/sign_in", loginData, {
      withCredentials: true, // Enable sending/receiving cookies
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const logout = async (): Promise<void> => {
  try {
    await backendInstance.post(
      "/auth/logout",
      {},
      {
        withCredentials: true, // Enable sending cookies
      },
    );
  } catch (error) {
    throw error;
  }
};

const uploadAvatar = async (formData: FormData): Promise<void> => {
  try {
    await backendInstance.put("/auth/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true, // Enable sending cookies
    });
  } catch (error) {
    throw error;
  }
};

const updateName = async (username: string): Promise<void> => {
  try {
    await backendInstance.put(
      "/auth/name",
      { username },
      {
        withCredentials: true, // Enable sending cookies
      },
    );
  } catch (error) {
    throw error;
  }
};

const updatePassword = async (
  oldPassword: string,
  newPassword: string,
): Promise<void> => {
  try {
    await backendInstance.put(
      "/auth/password",
      { oldPassword, newPassword },
      {
        withCredentials: true, // Enable sending cookies
      },
    );
  } catch (error) {
    throw error;
  }
};

const deleteAccount = async (): Promise<void> => {
  try {
    await backendInstance.delete("/auth/account", {
      withCredentials: true, // Enable sending cookies
    });
  } catch (error) {
    throw error;
  }
};

const sendRecoverCode = async (email: string): Promise<void> => {
  try {
    await backendInstance.post("/auth/password-recovery", { email });
  } catch (error) {
    throw error;
  }
};

const verifyRecoverCode = async (
  email: string,
  code: string,
): Promise<void> => {
  try {
    await backendInstance.post("/auth/password-recovery/verification", {
      email,
      code,
    });
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (
  email: string,
  code: string,
  newPassword: string,
): Promise<void> => {
  try {
    await backendInstance.patch("/auth/password-recovery", {
      email,
      code,
      newPassword,
    });
  } catch (error) {
    throw error;
  }
};

export {
  signUp,
  signIn,
  logout,
  uploadAvatar,
  updateName,
  updatePassword,
  deleteAccount,
  sendRecoverCode,
  verifyRecoverCode,
  resetPassword,
};
