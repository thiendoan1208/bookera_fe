"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { backendInstance } from "@/config/axios";

interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  role_id: number;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user from backend
  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const response = await backendInstance.get("/auth/me", {
        withCredentials: true,
      });
      setUser(response.data.user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // If token is invalid, clear it
      setUser(null);

      // Clear invalid session token cookie
      document.cookie =
        "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  // Clear user (for logout)
  const clearUser = () => {
    setUser(null);
  };

  // Fetch user on mount (when app loads/refreshes)
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        setUser,
        refreshUser,
        clearUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the UserContext
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
