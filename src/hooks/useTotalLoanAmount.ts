import { useQuery } from '@tanstack/react-query';
import { getLoans, getTotalLoanAmount } from '@/actions/loans';

export function useTotalLoanAmount(account: string) {
    return useQuery({
        queryKey: ['totalLoanAmount', account],
        queryFn: () => getTotalLoanAmount(account),
        enabled: !!account,
        refetchInterval: 2000,
    });
} 

export function useLoans(account?: string) {
    return useQuery({
        queryKey: ['loans', account],
        queryFn: () => getLoans(account),
        enabled: !!account,
        refetchInterval: 2000,
    });
}