import React, { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './state/queryClient';
import { AuthProvider } from './hooks/useAuth';
import AppNavigator from './navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaperTheme } from './src/theme/theme';


export default function App() {
  return (
    <SafeAreaView style={{ flex: 1}}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={PaperTheme}>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaView>

  );
}