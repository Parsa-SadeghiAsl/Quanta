// src/hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import client from "../api/client"; // Your axios client

// Define the shape of your User and Auth context
type User = { id: number; username: string; email: string } | null;
type AuthContextType = {
  user: User;
  loading: boolean;
  signIn: (username, password) => Promise<void>;
  signOut: () => Promise<void>;
  register: (username, email, password) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // This effect runs on app startup to check for an existing token
  useEffect(() => {
    const bootstrapAsync = async () => {
      let accessToken: string | null = null;
      try {
        accessToken = await SecureStore.getItemAsync("accessToken");
        if (accessToken) {
          // You would typically validate the token or fetch user profile here
          // For now, we'll assume the token means the user is logged in.
          // In a real app, you'd decode the JWT or have a /users/me endpoint
          // For this example, we'll just set a placeholder user if a token exists
          setUser({ id: 0, username: 'User', email: '' }); // Placeholder
        }
      } catch (e) {
        console.error("Could not restore token", e);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const signIn = async (username, password) => {
    // Note: We are sending `username`, not `email`
    const response = await client.post("/auth/token/", { username, password });
    await SecureStore.setItemAsync("accessToken", response.data.access);
    await SecureStore.setItemAsync("refreshToken", response.data.refresh);
    // After login, you might want to fetch the user's profile
    setUser({ id: 0, username, email: '' }); // Placeholder user
  };

  const register = async (username, email, password) => {
    // The backend register endpoint expects username, email, and password
    await client.post("/auth/register/", { username, email, password });
    // After successful registration, automatically sign the user in
    await signIn(username, password);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, register }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily access auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};