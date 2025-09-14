import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, FlatList, Text, TouchableOpacity } from 'react-native';
import { Appbar, Button, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { format, subMonths, addMonths, isSameMonth, isAfter } from 'date-fns';


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

const DashboardContent = ({ summary, spending, budgets, transactions, navigation, selectedMonth, selectedYear }) => (
  <>
  <View style={{marginHorizontal:10}}>
    <View style={styles.summaryContainer}>
      <SummaryCard title="Income" value={`+$${summary?.monthly_income || '0.00'}`} positive />
      <SummaryCard title="Expenses" value={`-$${summary?.monthly_expenses || '0.00'}`} negative />
    </View>
    <View style={styles.summaryContainer}>
      <SummaryCard title="Total Balance" value={`$${summary?.total_balance || '0.00'}`} />
    </View>
  </View>
    <SpendingChart data={spending} month={selectedMonth} year={selectedYear} />
    <BudgetProgress data={budgets} />
    <RecentTransactions data={transactions} navigation={navigation} />
  </>
);

const MonthSelector = ({ currentDate, setCurrentDate, isNextDisabled }) => {
    const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
    const handleNextMonth = () => {
        if (!isNextDisabled) {
            setCurrentDate(prev => addMonths(prev, 1));
        }
    };

    return (
        <View style={styles.monthSelector}>
            <Appbar.Action icon="chevron-left" onPress={handlePrevMonth} />
            <Text style={styles.monthText}>{format(currentDate, 'MMMM yyyy')}</Text>
            <Appbar.Action
                icon="chevron-right"
                onPress={handleNextMonth}
                disabled={isNextDisabled}
            />
        </View>
    );
};


export default function Dashboard() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const [currentDate, setCurrentDate] = useState(new Date());

  const selectedYear = useMemo(() => currentDate.getFullYear(), [currentDate]);
  const selectedMonth = useMemo(() => currentDate.getMonth() + 1, [currentDate]);
  const { data: summary, isLoading: summaryLoading, isFetching: summaryFetching, refetch: refetchSummary } = useDashboardSummary(selectedYear, selectedMonth);
  const { data: spending, isLoading: spendingLoading, isFetching: spendingFetching, refetch: refetchSpending } = useSpendingByCategory(selectedYear, selectedMonth);
  const { data: budgets, isLoading: budgetsLoading, isFetching: budgetsFetching, refetch: refetchBudgets } = useBudgetProgress(selectedYear, selectedMonth);
  const { data: transactions, isLoading: transactionsLoading, isFetching: transactionsFetching, refetch: refetchTransactions } = useRecentTransactions();

  const isLoading = summaryLoading || spendingLoading || budgetsLoading || transactionsLoading;
  const isRefreshing = summaryFetching || spendingFetching || budgetsFetching || transactionsFetching;

  const isNextMonthDisabled = useMemo(() => {
    const now = new Date();
    return isSameMonth(currentDate, now) || isAfter(currentDate, now);
  }, [currentDate]);

  const onRefresh = useCallback(async () => {
    await Promise.all([
        refetchSummary(),
        refetchSpending(),
        refetchBudgets(),
        refetchTransactions(),
    ]);
  }, [refetchSummary, refetchSpending, refetchBudgets, refetchTransactions]);

  return (
      <View style={styles.container}>
        <MonthSelector
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            isNextDisabled={isNextMonthDisabled}
        />

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
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
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
    padding: 5, 
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

