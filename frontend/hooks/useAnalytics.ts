// src/hooks/useAnalytics.ts
import { useQuery } from '@tanstack/react-query';
import client from '../api/client';

// NOTE: These hooks assume your backend has the corresponding endpoints.
// Example: GET /api/dashboard/summary/, GET /api/analytics/spending-by-category/, etc.

/**
 * Fetches summary data: total balance, monthly income, and expenses.
 */
export const useDashboardSummary = () =>
  useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const { data } = await client.get('/dashboard/summary/');
      return data;
    },
  });

/**
 * Fetches spending grouped by category for the current month.
 */
export const useSpendingByCategory = () =>
  useQuery({
    queryKey: ['spendingByCategory'],
    queryFn: async () => {
      const { data } = await client.get('/analytics/spending-by-category/');
      return data;
    },
  });

/**
 * Fetches budget progress for active budgets.
 */
export const useBudgetProgress = () =>
  useQuery({
    queryKey: ['budgetProgress'],
    queryFn: async () => {
      const { data } = await client.get('/budgets/progress/');
      return data;
    },
  });

/**
 * Fetches the 5 most recent transactions.
 */
export const useRecentTransactions = () =>
  useQuery({
    queryKey: ['recentTransactions'],
    queryFn: async () => {
      const { data } = await client.get('/transactions/', { params: { limit: 5 } });
      return data;
    },
  });