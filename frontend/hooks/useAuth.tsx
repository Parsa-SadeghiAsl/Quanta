// src/hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import client from "../api/client"; // Your axios client
import { useQueryClient } from '@tanstack/react-query';


// Define the shape of the user object for type safety
type User = {
  id: number;
  username: string;
  email: string;
};

// Define the context type
type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (username, password) => Promise<void>;
  register: (username, email, password) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();


  useEffect(() => {
    // This function runs on app startup to check for an existing session
    const bootstrapAsync = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        if (accessToken) {
          // If a token exists, fetch the user's profile to validate it
          const { data } = await client.get('/auth/me/');
          setUser(data);
        }
      } catch (e) {
        // This can happen if the token is expired or invalid
        console.error('Failed to restore session:', e);
        // Ensure user is fully logged out if session restoration fails
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAsync();
  }, []);


const signIn = async (username, password) => {
    // 1. Get authentication tokens
    const response = await client.post('/auth/token/', { username, password });
    await SecureStore.setItemAsync('accessToken', response.data.access);
    await SecureStore.setItemAsync('refreshToken', response.data.refresh);
    
    // 2. Fetch the user's actual profile data from the backend
    const { data } = await client.get('/auth/me/');
    // 3. Set the user in the state with the real data
    setUser(data);

    // 4. Invalidate all queries to refetch data for the newly logged-in user
    await queryClient.invalidateQueries();
  };

  const register = async (username, email, password) => {
    await client.post('/auth/register/', { username, email, password });
    // After registration, signIn will fetch the profile and invalidate the cache
    await signIn(username, password);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    setUser(null);
    // Also clear the cache on logout to remove sensitive data
    await queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};