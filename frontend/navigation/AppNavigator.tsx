import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';

// --- Screens ---
import SignIn from '../screens/Auth/SignIn';
import SignUp from '../screens/Auth/SignUp';
import Dashboard from '../screens/Dashboard/Dashboard';
import AccountsScreen from '../screens/AccountsScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import AddAccountScreen from '../screens/AddAccountScreen';
import RecurringTransactionsScreen from '../screens/RecurringTransactionsScreen';
import AddRecurringTransactionScreen from '../screens/AddRecurringTransactionScreen';
import BudgetsScreen from '../screens/BudgetsScreen';
import AddBudgetScreen from '../screens/AddBudgetScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import AddCategoryScreen from '../screens/AddCategoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Dashboard: undefined;
  Accounts: undefined;
  Transactions: undefined;
  AddTransaction: undefined;
  AddAccount: undefined;
  RecurringTransactions: undefined;
  AddRecurringTransaction: undefined;
  Budgets: undefined;
  AddBudget: { item?: any };
  Categories: undefined;
  AddCategory: { item?: any };
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
            <Stack.Screen name="Accounts" component={AccountsScreen} />
            <Stack.Screen name="Transactions" component={TransactionsScreen} options={{ title: 'All Transactions' }} />
            <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Add Transaction' }} />
            <Stack.Screen name="AddAccount" component={AddAccountScreen} options={{ title: 'Add New Account' }} />
            <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Manage Categories' }} />
            <Stack.Screen name="RecurringTransactions" component={RecurringTransactionsScreen} options={{ title: 'Recurring' }} />
            <Stack.Screen name="AddRecurringTransaction" component={AddRecurringTransactionScreen} options={{ title: 'Add Recurring' }} />
            <Stack.Screen name="Budgets" component={BudgetsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AddBudget" component={AddBudgetScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AddCategory" component={AddCategoryScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />

          </>
        ) : (
          <>
            <Stack.Screen name="SignIn" component={SignIn} options={{ title: 'Sign In' }} />
            <Stack.Screen name="SignUp" component={SignUp} options={{ title: 'Create Account' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

