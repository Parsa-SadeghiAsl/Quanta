import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import client from '../api/client';

// ====================================================================================
// I. API Type Definitions
// ====================================================================================

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

// --- Payload Types for Mutations ---

export interface NewAccountPayload {
    name: string;
    account_type: string;
    balance: string;
}

export interface UpdateAccountPayload {
    id: number;
    name: string;
    account_type: string;
}

export interface NewCategoryPayload {
    name: string;
    type: 'income' | 'expense';
    color: string;
}

export interface UpdateCategoryPayload extends NewCategoryPayload {
    id: number;
}

export interface NewTransactionPayload {
    account: number;
    category?: number;
    amount: string;
    date: string; // YYYY-MM-DD
    notes?: string;
}

export interface NewBudgetPayload {
    category: number;
    amount: string;
    start_date: string;
    end_date: string;
}

export interface UpdateBudgetPayload extends NewBudgetPayload {
    id: number;
}

export interface NewRecurringTransactionPayload {
    account: number;
    category: number;
    amount: string;
    notes: string;
    start_date: string;
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

// ====================================================================================
// II. Centralized Query Keys
// ====================================================================================

/**
 * A centralized object for managing React Query keys.
 * This prevents typos and ensures consistency across the app.
 */
export const queryKeys = {
    accounts: ['accounts'],
    transactions: ['transactions'],
    categories: ['categories'],
    userCategories: ['categories', 'user'],
    budgets: ['budgets'],
    recurringTransactions: ['recurringTransactions'],
    profile: ['profile'],
    summary: (year: number, month: number) => ['summary', year, month],
    spendingByCategory: (year: number, month: number) => ['spendingByCategory', year, month],
    budgetProgress: (year: number, month: number) => ['budgetProgress', year, month],
    recentTransactions: ['recentTransactions'],
    exportTransactions: ['exportTransactions'],
};

// ====================================================================================
// III. Generic API Mutation Hook
// ====================================================================================

/**
 * A generic hook for handling API mutations (POST, PUT, PATCH, DELETE).
 * It automatically handles query invalidation on success to keep data fresh.
 * @param mutationFn The async function that performs the mutation (e.g., calling the API client).
 * @param keysToInvalidate An array of query keys to invalidate upon successful mutation.
 */
const useApiMutation = <TData = unknown, TError = Error, TVariables = void>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    keysToInvalidate: QueryKey[] = []
) => {
    const queryClient = useQueryClient();

    return useMutation<TData, TError, TVariables>({
        mutationFn,
        onSuccess: () => {
            // Invalidate each specified query to refetch fresh data
            keysToInvalidate.forEach((key) => {
                queryClient.invalidateQueries({ queryKey: key });
            });
        },
    });
};

// ====================================================================================
// IV. API Hooks by Feature
// ====================================================================================

// --- Accounts ---

export const useAccounts = () =>
    useQuery<Account[]>({
        queryKey: queryKeys.accounts,
        queryFn: () => client.get('/accounts/').then((res) => res.data),
    });

export const useCreateAccount = () =>
    useApiMutation(
        (payload: NewAccountPayload) => client.post('/accounts/', payload),
        [queryKeys.accounts, ['summary']] // Invalidate summary for updated totals
    );

export const useUpdateAccount = () =>
    useApiMutation(
        (account: UpdateAccountPayload) => client.patch(`/accounts/${account.id}/`, account),
        [queryKeys.accounts, ['summary']]
    );

export const useDeleteAccount = () =>
    useApiMutation(
        (accountId: number) => client.delete(`/accounts/${accountId}/`),
        [queryKeys.accounts, ['summary'], queryKeys.transactions] // Also invalidate transactions
    );

// --- Categories ---

export const useCategories = () =>
    useQuery<Category[]>({
        queryKey: queryKeys.categories,
        queryFn: () => client.get('/categories/').then((res) => res.data),
    });

export const useUserCategories = () =>
    useQuery<Category[]>({
        queryKey: queryKeys.userCategories,
        queryFn: () => client.get('/categories/mine/').then((res) => res.data),
    });

export const useCreateCategory = () =>
    useApiMutation(
        (newCategory: NewCategoryPayload) => client.post('/categories/', newCategory),
        [queryKeys.userCategories, queryKeys.categories]
    );

export const useUpdateCategory = () =>
    useApiMutation(
        (category: UpdateCategoryPayload) => client.put(`/categories/${category.id}/`, category),
        [queryKeys.userCategories, queryKeys.categories]
    );

export const useDeleteCategory = () =>
    useApiMutation(
        (categoryId: number) => client.delete(`/categories/${categoryId}/`),
        [queryKeys.userCategories, queryKeys.categories]
    );

// --- Transactions ---

export const useAllTransactions = () =>
    useQuery<Transaction[]>({
        queryKey: queryKeys.transactions,
        queryFn: () => client.get('/transactions/').then((res) => res.data),
    });

export const useCreateTransaction = () =>
    useApiMutation(
        (payload: NewTransactionPayload) => client.post('/transactions/', payload),
        [
            queryKeys.transactions,
            queryKeys.accounts,
            queryKeys.budgets,
            ['summary'],
            ['spendingByCategory'],
            ['budgetProgress'],
            queryKeys.recentTransactions,
        ]
    );

// --- Recurring Transactions ---

export const useRecurringTransactions = () =>
    useQuery<RecurringTransaction[]>({
        queryKey: queryKeys.recurringTransactions,
        queryFn: () => client.get('/recurring-transactions/').then((res) => res.data),
    });

export const useCreateRecurringTransaction = () =>
    useApiMutation(
        (payload: NewRecurringTransactionPayload) => client.post('/recurring-transactions/', payload),
        [queryKeys.recurringTransactions]
    );

export const useUpdateRecurringTransaction = () =>
    useApiMutation(
        (payload: Partial<NewRecurringTransactionPayload> & { id: number }) =>
            client.patch(`/recurring-transactions/${payload.id}/`, payload),
        [queryKeys.recurringTransactions]
    );

export const useDeleteRecurringTransaction = () =>
    useApiMutation(
        (id: number) => client.delete(`/recurring-transactions/${id}/`),
        [queryKeys.recurringTransactions]
    );

// --- Budgets ---

export const useCreateBudget = () =>
    useApiMutation(
        (newBudget: NewBudgetPayload) => client.post('/budgets/', newBudget),
        [queryKeys.budgets, ['budgetProgress']]
    );

export const useUpdateBudget = () =>
    useApiMutation(
        (updatedBudget: UpdateBudgetPayload) => client.put(`/budgets/${updatedBudget.id}/`, updatedBudget),
        [queryKeys.budgets, ['budgetProgress']]
    );

export const useDeleteBudget = () =>
    useApiMutation(
        (budgetId: number) => client.delete(`/budgets/${budgetId}/`),
        [queryKeys.budgets, ['budgetProgress']]
    );

// --- Analytics & Dashboard ---

export const useDashboardSummary = (year: number, month: number) =>
    useQuery({
        queryKey: queryKeys.summary(year, month),
        queryFn: () => client.get('/analytics/summary/', { params: { year, month } }).then((res) => res.data),
    });

export const useSpendingByCategory = (year: number, month: number) =>
    useQuery({
        queryKey: queryKeys.spendingByCategory(year, month),
        queryFn: () => client.get('/analytics/spending-by-category/', { params: { year, month } }).then((res) => res.data),
    });

export const useRecentTransactions = () =>
    useQuery<Transaction[]>({
        queryKey: queryKeys.recentTransactions,
        queryFn: () => client.get('/analytics/recent-transactions/').then((res) => res.data),
    });

export const useBudgetProgress = (year: number, month: number) =>
    useQuery<Budget[]>({
        queryKey: queryKeys.budgetProgress(year, month),
        queryFn: () => client.get('/analytics/budget-progress/', { params: { year, month } }).then((res) => res.data),
    });

// --- Profile & Authentication ---

export const useProfile = () =>
    useQuery<Profile>({
        queryKey: queryKeys.profile,
        queryFn: () => client.get('/auth/me/').then((res) => res.data),
    });

export const useUpdateProfile = () =>
    useApiMutation(
        (payload: UpdateProfilePayload) => {
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
        [queryKeys.profile]
    );

export const useChangePassword = () =>
    useApiMutation((payload: ChangePasswordPayload) => client.post('/auth/change-password/', payload));

// --- Import & Export ---

export const useImportTransactions = () =>
    useApiMutation(
        (formData: FormData) =>
            client.post('/transactions/import_csv/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
        // Invalidate everything to be safe after a bulk import
        [] // Passing an empty array to invalidate the entire cache
    );

export const useExportTransactions = () => {
    return useQuery({
        queryKey: queryKeys.exportTransactions,
        queryFn: () => client.get('/transactions/export_csv/').then((res) => res.data),
        enabled: false, // This query will not run automatically
    });
};