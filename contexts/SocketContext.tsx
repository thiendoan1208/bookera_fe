"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "./UserContext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socketState, setSocketState] = useState<{
    socket: Socket | null;
    isConnected: boolean;
  }>({ socket: null, isConnected: false });
  const { user } = useUser();

  useEffect(() => {
    let newSocket: Socket | null = null;

    // Only connect if user is authenticated
    if (user) {
      const socketUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(
        "/api",
        "",
      );
      newSocket = io(socketUrl || "http://localhost:8080", {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        setSocketState({ socket: newSocket, isConnected: true });

        // Join user-specific room for notifications
        if (user?.id) {
          newSocket?.emit("join_user_room", user.id);
        }
      });

      newSocket.on("disconnect", () => {
        setSocketState((prev) => ({ ...prev, isConnected: false }));
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setSocketState((prev) => ({ ...prev, isConnected: false }));
      });
    }

    // Cleanup on unmount or user change
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
      setSocketState({ socket: null, isConnected: false });
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socketState}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
