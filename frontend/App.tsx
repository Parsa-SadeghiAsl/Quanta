import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './state/queryClient';
import { AuthProvider } from './hooks/useAuth';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    // This QueryClientProvider is for data fetching
    <QueryClientProvider client={queryClient}>
      {/* This PaperProvider is required for react-native-paper components */}
      <PaperProvider>
        {/* This AuthProvider manages user login state */}
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}