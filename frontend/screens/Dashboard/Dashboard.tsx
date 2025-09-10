import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, FlatList, Text, TouchableOpacity } from 'react-native';
import { Appbar, Button, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../hooks/useAuth';
import { format, subMonths, addMonths } from 'date-fns';

import {
  useDashboardSummary,
  useSpendingByCategory,
  useBudgetProgress,
  useRecentTransactions,
} from '../../hooks/useApi';

import SummaryCard from '../../components/dashboard/SummaryCard';
import SpendingChart from '../../components/dashboard/SpendingChart';
import BudgetProgress from '../../components/dashboard/BudgetProgress';
import RecentTransactions from '../../components/dashboard/RecentTransactions';

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

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

const MonthSelector = ({ currentDate, setCurrentDate }) => {
    const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
    const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

    return (
        <View style={styles.monthSelector}>
            <Appbar.Action icon="chevron-left" onPress={handlePrevMonth} />
            <Text style={styles.monthText}>{format(currentDate, 'MMMM yyyy')}</Text>
            <Appbar.Action icon="chevron-right" onPress={handleNextMonth} />
        </View>
    );
};


export default function Dashboard() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { signOut } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const selectedYear = useMemo(() => currentDate.getFullYear(), [currentDate]);
  const selectedMonth = useMemo(() => currentDate.getMonth() + 1, [currentDate]);

  const { data: summary, isLoading: summaryLoading, isFetching: summaryFetching, refetch: refetchSummary } = useDashboardSummary(selectedYear, selectedMonth);
  const { data: spending, isLoading: spendingLoading, isFetching: spendingFetching, refetch: refetchSpending } = useSpendingByCategory(selectedYear, selectedMonth);
  const { data: budgets, isLoading: budgetsLoading, isFetching: budgetsFetching, refetch: refetchBudgets } = useBudgetProgress(selectedYear, selectedMonth);
  const { data: transactions, isLoading: transactionsLoading, isFetching: transactionsFetching, refetch: refetchTransactions } = useRecentTransactions();

  const isLoading = summaryLoading || spendingLoading || budgetsLoading || transactionsLoading;
  const isRefreshing = summaryFetching || spendingFetching || budgetsFetching || transactionsFetching;

  const onRefresh = useCallback(async () => {
    await Promise.all([
        refetchSummary(),
        refetchSpending(),
        refetchBudgets(),
        refetchTransactions(),
    ]);
  }, [refetchSummary, refetchSpending, refetchBudgets, refetchTransactions]);


  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const navigateTo = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
    closeMenu();
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Dashboard" />
        <Button icon="plus" mode="contained" onPress={() => navigateTo('AddTransaction')}>
          New Transaction
        </Button>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={<Appbar.Action icon="dots-vertical" onPress={openMenu} />}
        >
          <Menu.Item onPress={() => navigateTo('Accounts')} title="My Accounts" />
          <Menu.Item onPress={() => navigateTo('Transactions')} title="All Transactions" />
          <Menu.Item onPress={() => navigateTo('RecurringTransactions')} title="Recurring" />
          <Menu.Item onPress={() => navigateTo('Budgets')} title= "Budgets" />
          <Menu.Item onPress={() => navigateTo('Categories')} title="Manage Categories" />
          <Menu.Item onPress={() => navigateTo('Profile')} title="My Profile" />
          <Menu.Item onPress={() => signOut()} title="Logout" />
        </Menu>
      </Appbar.Header>

      <MonthSelector currentDate={currentDate} setCurrentDate={setCurrentDate} />

      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" />
      ) : (
        <FlatList
          data={[]}
          keyExtractor={() => 'key'}
          renderItem={null}
          ListHeaderComponent={
            <DashboardContent
              summary={summary}
              spending={spending}
              budgets={budgets}
              transactions={transactions}
              navigation={navigation}
            />
          }
          onRefresh={onRefresh}
          refreshing={isRefreshing}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8' 
    },
    
  loader: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
    },

  summaryContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    padding: 10 
    },

  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 10,
  },

  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

});

