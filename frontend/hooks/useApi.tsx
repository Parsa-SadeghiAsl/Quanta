import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';

// --- Type Definitions ---

export type Account = {
    id: number;
    name: string;
    account_type: string;
    balance: string;
};

export interface UpdateAccountPayload {
    id: number;
    name: string;
    account_type: string;
}

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
type NewCategoryPayload = { name: string; type: 'income' | 'expense'; color: string; };
type UpdateCategoryPayload = NewCategoryPayload & { id: number; };

// --- Centralized Mutation Hook ---
const useSubmit = <TData, TVariables>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    invalidatedQueryKeys: (string | (string | number)[])[] = []
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        onSuccess: () => {
            // Invalidate all specified queries on success
            invalidatedQueryKeys.forEach(key => {
                queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
            });
        },
    });
};


// --- API Hooks ---

// ACCOUNTS
export const useAccounts = () => useQuery<Account[]>({ queryKey: ['accounts'], queryFn: () => client.get('/accounts/').then(res => res.data.data) });
export const useCreateAccount = () => useSubmit((payload: NewAccountPayload) => client.post('/accounts/', payload), [['accounts'], ['summary']]);
export const useUpdateAccount = () => useSubmit((account: UpdateAccountPayload) => client.patch(`/accounts/${account.id}/`, account), [['accounts'], ['summary']]);
export const useDeleteAccount = () => useSubmit((accountId: number) => client.delete(`/accounts/${accountId}/`), [['accounts'], ['summary']]);

// TRANSACTIONS
export const useAllTransactions = () => useQuery<Transaction[]>({ queryKey: ['transactions', 'all'], queryFn: () => client.get('/transactions/').then(res => res.data.data) });
export const useCreateTransaction = () => useSubmit((payload: NewTransactionPayload) => client.post('/transactions/', payload), [['transactions'], ['summary'], ['accounts'], ['spendingByCategory'], ['budgets']]);

// CATEGORIES
export const useCategories = () => useQuery<Category[]>({ queryKey: ['categories', 'all'], queryFn: () => client.get('/categories/').then(res => res.data.data) });
export const useUserCategories = () => useQuery<Category[]>({ queryKey: ['categories', 'user'], queryFn: () => client.get('/categories/mine/').then(res => res.data.data) });
export const useCreateCategory = () => useSubmit((newCategory: NewCategoryPayload) => client.post('/categories/', newCategory), [['categories', 'all'], ['categories', 'user']]);
export const useUpdateCategory = () => useSubmit((category: UpdateCategoryPayload) => client.put(`/categories/${category.id}/`, category), [['categories', 'all'], ['categories', 'user']]);
export const useDeleteCategory = () => useSubmit((categoryId: number) => client.delete(`/categories/${categoryId}/`), [['categories', 'all'], ['categories', 'user']]);

// BUDGETS
export const useBudgets = () => useQuery<Budget[]>({ queryKey: ['budgets'], queryFn: () => client.get('/budgets/').then(res => res.data.data) });
export const useCreateBudget = () => useSubmit((newBudget: Omit<Budget, 'id' | 'spent' | 'created_at' | 'category_details'>) => client.post('/budgets/', newBudget), [['budgets'], ['budgetProgress']]);
export const useUpdateBudget = () => useSubmit((updatedBudget: Omit<Budget, 'spent' | 'created_at' | 'category_details'>) => client.put(`/budgets/${updatedBudget.id}/`, updatedBudget), [['budgets'], ['budgetProgress']]);
export const useDeleteBudget = () => useSubmit((budgetId: number) => client.delete(`/budgets/${budgetId}/`), [['budgets'], ['budgetProgress']]);

// RECURRING TRANSACTIONS
export const useRecurringTransactions = () => useQuery<RecurringTransaction[]>({ queryKey: ['recurringTransactions'], queryFn: () => client.get('/recurring-transactions/').then(res => res.data.data) });
export const useCreateRecurringTransaction = () => useSubmit((payload: NewRecurringTransactionPayload) => client.post('/recurring-transactions/', payload), [['recurringTransactions']]);
export const useUpdateRecurringTransaction = () => useSubmit((payload: Partial<NewRecurringTransactionPayload> & { id: number }) => client.patch(`/recurring-transactions/${payload.id}/`, payload), [['recurringTransactions']]);
export const useDeleteRecurringTransaction = () => useSubmit((id: number) => client.delete(`/recurring-transactions/${id}/`), [['recurringTransactions']]);

// ANALYTICS
export const useDashboardSummary = (year: number, month: number) => useQuery({ queryKey: ['summary', year, month], queryFn: () => client.get('/analytics/summary/', { params: { year, month } }).then(res => res.data.data) });
export const useSpendingByCategory = (year: number, month: number) => useQuery({ queryKey: ['spendingByCategory', year, month], queryFn: () => client.get('/analytics/spending-by-category/', { params: { year, month } }).then(res => res.data.data) });
export const useRecentTransactions = () => useQuery<Transaction[]>({ queryKey: ['recentTransactions'], queryFn: () => client.get('/analytics/recent-transactions/').then(res => res.data.data) });
export const useBudgetProgress = (year: number, month: number) => useQuery<Budget[]>({ queryKey: ['budgetProgress', year, month], queryFn: () => client.get('/analytics/budget-progress/', { params: { year, month } }).then(res => res.data.data) });

// PROFILE
export const useProfile = () => useQuery<Profile>({ queryKey: ['profile'], queryFn: () => client.get('/auth/me/').then(res => res.data.data) });
export const useUpdateProfile = () => useSubmit((payload: UpdateProfilePayload) => {
    const formData = new FormData();
    if (payload.username) formData.append('username', payload.username);
    if (payload.avatar) formData.append('avatar', payload.avatar as any);
    return client.patch('/auth/me/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}, [['profile']]);
export const useChangePassword = () => useSubmit((payload: ChangePasswordPayload) => client.post('/auth/change-password/', payload));

// IMPORT / EXPORT
export const useImportTransactions = () => useSubmit((formData: FormData) => client.post('/transactions/import_csv/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }), []);
export const useExportTransactions = () => useQuery({ queryKey: ['exportTransactions'], queryFn: () => client.get('/transactions/export_csv/').then(res => res.data.data), enabled: false });