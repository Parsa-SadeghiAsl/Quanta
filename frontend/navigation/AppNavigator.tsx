import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';

// --- Screens ---
import SignIn from '../screens/Auth/SignIn';
import SignUp from '../screens/Auth/SignUp';
import Dashboard from '../screens/Dashboard/Dashboard';
// Import your new placeholder screens
import AccountsScreen from '../screens/AccountsScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';

// This defines all the screens available in your app
export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Dashboard: undefined;
  Accounts: undefined;
  Transactions: undefined;
  AddTransaction: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a splash screen component
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Screens available only to logged-in users
          <>
            <Stack.Screen
              name="Dashboard"
              component={Dashboard}
              options={{ headerShown: false }} // We use a custom header inside the dashboard
            />
            <Stack.Screen name="Accounts" component={AccountsScreen} />
            <Stack.Screen name="Transactions" component={TransactionsScreen} options={{ title: 'All Transactions' }} />
            <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Add Transaction' }} />
          </>
        ) : (
          // Auth screens
          <>
            <Stack.Screen name="SignIn" component={SignIn} options={{ title: 'Sign In' }} />
            <Stack.Screen name="SignUp" component={SignUp} options={{ title: 'Create Account' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

