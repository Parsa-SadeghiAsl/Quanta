import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';

// --- Type Definitions ---

export type Account = {
  id: number;
  name: string;
  account_type: string;
  balance: string;
};

export type Category = {
  id: number;
  name: string;
  type: 'income' | 'expense';
  color: string;
};

export type Transaction = {
  id: number;
  amount: string;
  date: string;
  notes: string;
  account: number;
  category: number | null;
  category_details?: Category;
  account_details?: Account;
};

export type Budget = {
  id: number;
  category: number;
  category_details: Category;
  amount: string;
  start_date: string; // 'YYYY-MM-DD'
  end_date: string; // 'YYYY-MM-DD'
  created_at: string; // ISO string
  spent: number;
};

export type RecurringTransaction = {
    id: number;
    notes: string;
    amount: string;
    account: number;
    category: number;
    start_date: string;
    next_date: string;
    frequency: 'monthly';
    account_details?: Account;
    category_details?: Category;
};

export interface Profile {
    username: string;
    email: string;
    avatar: string | null;
}

export interface UpdateProfilePayload {
    username?: string;
    avatar?: { uri: string; name: string; type: string };
}

export interface ChangePasswordPayload {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
}


// --- Payload Types for Mutations ---
export type NewTransactionPayload = { /* ... */ };
export type NewAccountPayload = { /* ... */ };
export type NewRecurringTransactionPayload = {
    account: number;
    category: number;
    amount: string;
    notes: string;
    start_date: string;
};


// --- QUERY HOOKS (GET Data) ---

export const useAccounts = () => useQuery<Account[]>({ queryKey: ['accounts'], queryFn: () => client.get('/accounts/').then((res) => res.data) });
export const useAllTransactions = () => useQuery<Transaction[]>({ queryKey: ['transactions', 'all'], queryFn: () => client.get('/transactions/').then((res) => res.data) });

// --- CATEGORIES ---
type NewCategoryPayload = { name: string; type: 'income' | 'expense'; color: string; };
type UpdateCategoryPayload = NewCategoryPayload & { id: number; };


export const useCategories = () =>
  useQuery<Category[]>({
    queryKey: ['categories', 'all'],
    queryFn: () => client.get('/categories/').then((res) => res.data),
  });

export const useUserCategories = () =>
  useQuery<Category[]>({
    queryKey: ['categories', 'user'],
    queryFn: () => client.get('/categories/mine/').then((res) => res.data),
  });

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation<Category, Error, NewCategoryPayload>({
        mutationFn: (newCategory) => client.post('/categories/', newCategory),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories', 'user'] });
            queryClient.invalidateQueries({ queryKey: ['categories', 'all'] });
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation<Category, Error, UpdateCategoryPayload>({
        mutationFn: (category) => client.put(`/categories/${category.id}/`, category),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories', 'user'] });
            queryClient.invalidateQueries({ queryKey: ['categories', 'all'] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: (categoryId) => client.delete(`/categories/${categoryId}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories', 'user'] });
            queryClient.invalidateQueries({ queryKey: ['categories', 'all'] });
        },
    });
};


// Analytics hooks updated to accept year and month
export const useDashboardSummary = (year: number, month: number) =>
    useQuery({
        queryKey: ['summary', year, month],
        queryFn: () => client.get('/analytics/summary/', { params: { year, month } }).then((res) => res.data),
    });

export const useSpendingByCategory = (year: number, month: number) =>
    useQuery({
        queryKey: ['spendingByCategory', year, month],
        queryFn: () => client.get('/analytics/spending-by-category/', { params: { year, month } }).then((res) => res.data),
    });

    
export const useRecentTransactions = () =>
    useQuery<Transaction[]>({
        queryKey: ['recentTransactions'],
        // Call the new dedicated endpoint
        queryFn: () => client.get('/analytics/recent-transactions/').then((res) => res.data),
    });
        
        
export const useBudgetProgress = (year: number, month: number) =>
    useQuery<Budget[]>({
    queryKey: ['budgetProgress', year, month],
    // Call the new dedicated endpoint
    queryFn: () => client.get('/analytics/budget-progress/', { params: { year, month } }).then((res) => res.data),
    });

// --- Budgets (CRUD) ---
export const useBudgets = () =>
  useQuery<Budget[]>({
    queryKey: ['budgets'],
    queryFn: () => client.get('/budgets/').then((res) => res.data),
  });

export const useCreateBudget = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newBudget: Omit<Budget, 'id' | 'spent' | 'created_at' | 'category_details'>) => client.post('/budgets/', newBudget),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            queryClient.invalidateQueries({ queryKey: ['budgetProgress'] });
        },
    });
};

export const useUpdateBudget = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (updatedBudget: Omit<Budget, 'spent' | 'created_at' | 'category_details'>) => client.put(`/budgets/${updatedBudget.id}/`, updatedBudget),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            queryClient.invalidateQueries({ queryKey: ['budgetProgress'] });
        },
    });
};

export const useDeleteBudget = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (budgetId: number) => client.delete(`/budgets/${budgetId}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            queryClient.invalidateQueries({ queryKey: ['budgetProgress'] });
        },
    });
};


        // Hook for recurring transactions
export const useRecurringTransactions = () => useQuery<RecurringTransaction[]>({ queryKey: ['recurringTransactions'], queryFn: () => client.get('/recurring-transactions/').then((res) => res.data) });


// --- PROFILE HOOKS ---
export const useProfile = () =>
    useQuery<Profile>({
        queryKey: ['profile'],
        queryFn: () => client.get('/auth/me/').then((res) => res.data),
    });

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateProfilePayload) => {
            const formData = new FormData();
            if (payload.username) {
                formData.append('username', payload.username);
            }
            if (payload.avatar) {
                formData.append('avatar', payload.avatar as any);
            }
            return client.patch('/auth/me/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (payload: ChangePasswordPayload) =>
            client.post('/auth/change-password/', payload),
    });
};


// --- MUTATION HOOKS (Create, Update, Delete Data) ---

const useInvalidateQueries = (queryKeys: (string | (string|number)[])[]) => {
    const queryClient = useQueryClient();
    return {
        onSuccess: () => {
            queryKeys.forEach(key => {
                queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
            });
        },
    };
};

export const useCreateTransaction = () => useMutation({ mutationFn: (payload: NewTransactionPayload) => client.post('/transactions/', payload), ...useInvalidateQueries(['transactions', 'summary', 'accounts', 'spendingByCategory', 'budgets']) });
export const useCreateAccount = () => useMutation({ mutationFn: (payload: NewAccountPayload) => client.post('/accounts/', payload), ...useInvalidateQueries(['accounts', 'summary']) });
// Hooks for Recurring Transactions (Create, Update, Delete)
export const useCreateRecurringTransaction = () => useMutation({ mutationFn: (payload: NewRecurringTransactionPayload) => client.post('/recurring-transactions/', payload), ...useInvalidateQueries(['recurringTransactions']) });
export const useUpdateRecurringTransaction = () => useMutation({ mutationFn: (payload: Partial<NewRecurringTransactionPayload> & { id: number }) => client.patch(`/recurring-transactions/${payload.id}/`, payload), ...useInvalidateQueries(['recurringTransactions']) });
export const useDeleteRecurringTransaction = () => useMutation({ mutationFn: (id: number) => client.delete(`/recurring-transactions/${id}/`), ...useInvalidateQueries(['recurringTransactions']) });

