"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { UserProvider } from "@/contexts/UserContext";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
    >
      <QueryClientProvider client={queryClient}>
        <UserProvider>{children}</UserProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
