import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
import { Button, PaperProvider } from 'react-native-paper'
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { NavigationTheme, PaperTheme } from '../src/theme/theme';
import {AppColors} from '../src/theme/theme'
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
import CustomDrawerContent from '../components/CustomDrawerContent';
import DataManagementScreen from '../screens/DataManagementScreen';
import SpendingsScreen from '../screens/SpendingsScreen'

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
  DrawerApp: undefined; 
  DataManagement: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

// This stack contains all the screens accessible from the drawer
function AppDrawer() {
  const navigation = useNavigation();
  return (
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{ headerShown: true, headerStatusBarHeight: 0}}
        >
        <Drawer.Screen 
          name="Dashboard" 
          component={Dashboard} 
          options={{
            headerRight: () => (
            <Button style={styles.addBtton} icon="plus" mode="contained" onPress={() => navigation.navigate('AddTransaction')}>
              Transaction
            </Button>),
          }}
        />
        <Drawer.Screen name="All Transactions" component={TransactionsScreen} />
        <Drawer.Screen name="Spendings" component={SpendingsScreen} />
        <Drawer.Screen name="My Accounts" component={AccountsScreen} />
        <Drawer.Screen name="Budgets" component={BudgetsScreen} />
        <Drawer.Screen name="Recurring" component={RecurringTransactionsScreen} />
        <Drawer.Screen name="Categories" component={CategoriesScreen} />
        <Drawer.Screen name="Data Management" component={DataManagementScreen} />
        <Drawer.Screen name="Profile" component={ProfileScreen} />
      </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer theme={NavigationTheme}>
		<Stack.Navigator screenOptions={{headerShown: true, headerStatusBarHeight: 0}}>
			{user ? (
			<>
				<Stack.Screen name="DrawerApp" component={AppDrawer} options={{ headerShown: false }}/>
				<Stack.Screen name="Transactions" component={TransactionsScreen}  />
				<Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Add Transaction' }} />
				<Stack.Screen name="AddAccount" component={AddAccountScreen} options={{ title: 'Add New Account' }} />
				<Stack.Screen name="AddRecurringTransaction" component={AddRecurringTransactionScreen} options={{ title: 'Add Recurring' }} />
				<Stack.Screen name="AddBudget" component={AddBudgetScreen} />
				<Stack.Screen name="AddCategory" component={AddCategoryScreen} />

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

const styles = StyleSheet.create({
  addBtton:{
    marginRight: 10,
    marginTop: 2,
  }

});