import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { Appbar, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../hooks/useAuth';

// --- Data Fetching ---
import {
  useGetDashboardSummary,
  useGetSpendingByCategory,
  useGetBudgetProgress,
  useGetRecentTransactions,
} from '../../hooks/useApi';

// --- Child Components ---
import SummaryCard from '../../components/dashboard/SummaryCard';
import SpendingChart from '../../components/dashboard/SpendingChart';
import BudgetProgress from '../../components/dashboard/BudgetProgress';
import RecentTransactions from '../../components/dashboard/RecentTransactions';

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

// This component holds all the non-list content to avoid nested scroll views.
// It receives all the fetched data as props and passes it down to the child components.
const DashboardContent = ({ summary, spending, budgets, transactions, navigation }) => (
  <>
    <View style={styles.summaryContainer}>
      <SummaryCard title="Total Balance" value={`$${summary?.total_balance || '0.00'}`} />
      <SummaryCard title="Income" value={`+$${summary?.monthly_income || '0.00'}`} positive />
      <SummaryCard title="Expenses" value={`-$${summary?.monthly_expenses || '0.00'}`} negative />
    </View>
    <SpendingChart data={spending} />
    <BudgetProgress data={budgets} />
    <RecentTransactions data={transactions} navigation={navigation} />
  </>
);

export default function Dashboard() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { signOut } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  // Fetch all dashboard data in parallel using our custom hooks.
  // Each hook manages its own caching and refetching.
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: spending, isLoading: spendingLoading } = useGetSpendingByCategory();
  const { data: budgets, isLoading: budgetsLoading } = useGetBudgetProgress();
  const { data: transactions, isLoading: transactionsLoading } = useGetRecentTransactions();

  // Show a single loading indicator until all data has been fetched.
  const isLoading = summaryLoading || spendingLoading || budgetsLoading || transactionsLoading;

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const navigateTo = (screen: keyof RootStackParamList) => {
    closeMenu();
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      {/* Custom Header with Title, Add Button, and Expandable Menu */}
      <Appbar.Header>
        <Appbar.Content title="Dashboard" />
        <Appbar.Action icon="plus" onPress={() => navigateTo('AddTransaction')} />
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={<Appbar.Action icon="dots-vertical" onPress={openMenu} />}
        >
          <Menu.Item onPress={() => navigateTo('Accounts')} title="My Accounts" />
          <Menu.Item onPress={() => navigateTo('Transactions')} title="All Transactions" />
          <Menu.Item onPress={() => { closeMenu(); signOut(); }} title="Logout" />
        </Menu>
      </Appbar.Header>

      {isLoading ? (
        // Display a centered loading spinner while data is being fetched.
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        // Use a FlatList to render the content, which is best practice for performance.
        <FlatList
          style={styles.list}
          data={[]} // The list itself is empty because all content is in the header.
          keyExtractor={() => 'dashboard_list'}
          renderItem={null}
          // All visual components are placed inside the ListHeaderComponent.
          ListHeaderComponent={
            <DashboardContent
              summary={summary}
              spending={spending}
              budgets={budgets}
              transactions={transactions}
              navigation={navigation}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    paddingTop: 20,
  },
});

