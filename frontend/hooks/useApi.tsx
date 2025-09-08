import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client'; // Your configured axios client

// --- Accounts ---
export const useGetAccounts = () =>
  useQuery({
    queryKey: ['accounts'],
    queryFn: () => client.get('/accounts/').then((res) => res.data),
  });

// --- Categories ---
export const useGetCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: () => client.get('/categories/').then((res) => res.data),
  });

// --- Transactions ---
export const useGetAllTransactions = () =>
    useQuery({
        queryKey: ['transactions', 'all'],
        queryFn: () => client.get('/transactions/').then((res) => res.data),
    });

export const useGetRecentTransactions = () =>
    useQuery({
        queryKey: ['transactions', 'recent'],
        queryFn: () => client.get('/transactions/', { params: { limit: 5 } }).then((res) => res.data),
    });

// --- Mutations ---
export const useCreateTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newTransaction) => client.post('/transactions/', newTransaction),
        onSuccess: () => {
            // Invalidate and refetch relevant queries to show the new data
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['summary'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
};


// --- Analytics & Summary (Placeholders) ---
export const useGetDashboardSummary = () =>
    useQuery({
        queryKey: ['summary'],
        queryFn: () => client.get('/analytics/summary/').then((res) => res.data),
        initialData: { total_balance: "0.00", monthly_income: "0.00", monthly_expenses: "0.00" },
    });

export const useGetSpendingByCategory = () =>
    useQuery({
        queryKey: ['spendingByCategory'],
        queryFn: () => client.get('/analytics/spending-by-category/').then((res) => res.data),
        initialData: [],
    });

export const useGetBudgetProgress = () =>
    useQuery({
        queryKey: ['budgets'],
        queryFn: () => client.get('/budgets/').then((res) => res.data),
        initialData: [],
    });

