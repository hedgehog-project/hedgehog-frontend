import { useQuery } from '@tanstack/react-query';
import { getTransactions, type Transaction } from '@/app/actions/transactions';

export function useTransactions(token?: string) {
    return useQuery<Transaction[]>({
        queryKey: ['transactions', token],
        queryFn: () => getTransactions(token),
        refetchInterval: 5000, // Poll every 5 seconds
        staleTime: 4000, // Consider data stale after 4 seconds
    });
} 