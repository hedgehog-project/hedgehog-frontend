'use server';

import { db } from "@/db";
import { loans, loanRepayment } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export type Loan = {
    id: string;
    account: string;
    collateralAsset: string;
    loanAmountUSDC: number;
    collateralAmount: number;
    liquidationPrice: number;
    repaymentAmount: number;
    timestamp: number;
}

export type LoanRepayment = {
    id: string;
    loanId: string;
    token: string;
    account: string;
    timestamp: number;
}

export async function getLoans(account?: string) {
    try {
        const query = db
            .select()
            .from(loans)
            .where(account ? eq(loans.account, account) : undefined)
            .orderBy(desc(loans.timestamp));

        const results = await query;
        return results as Loan[];
    } catch (error) {
        console.error('Error fetching loans:', error);
        return [];
    }
}

export async function getAllLoans() {
    try {
        const query = db
            .select()
            .from(loans)
            .orderBy(desc(loans.timestamp));

        const results = await query;
        return results as Loan[];
    } catch (error) {
        console.error('Error fetching loans:', error);
        return [];
    }
}

export async function getLoanRepaymentsByAccount(account: string) {
    try {
        const query = db
            .select()
            .from(loanRepayment)
            .where(eq(loanRepayment.account, account))
            .orderBy(desc(loanRepayment.timestamp));

        const results = await query;
        return results as LoanRepayment[];
    } catch (error) {
        console.error('Error fetching loan repayments by account:', error);
        return [];
    }
}

export async function getLoanRepayments(account?: string, loanId?: string) {
    try {
        const query = db
            .select()
            .from(loanRepayment)
            .where(
                account 
                    ? eq(loanRepayment.account, account)
                    : loanId 
                        ? eq(loanRepayment.loanId, loanId)
                        : undefined
            )
            .orderBy(desc(loanRepayment.timestamp));

        const results = await query;
        return results as LoanRepayment[];
    } catch (error) {
        console.error('Error fetching loan repayments:', error);
        return [];
    }
}

export async function getTotalLoanAmount(account: string) {
    try {
        const query = db
            .select({ total: sql<number>`sum(${loans.loanAmountUSDC})` })
            .from(loans)
            .where(eq(loans.account, account));

        const result = await query;
        // Convert the amount from raw USDC (6 decimals) to human-readable format
        return result[0]?.total ? result[0].total / Math.pow(10, 6) : 0;
    } catch (error) {
        console.error('Error fetching total loan amount:', error);
        return 0;
    }
}

export async function getTotalPlatformBorrowedAmount() {
    try {
        const query = db
            .select({
                total: sql<number>`sum(${loans.loanAmountUSDC})`
            })
            .from(loans);

        const result = await query;
        // Convert the amount from raw USDC (6 decimals) to human-readable format
        return result[0]?.total ? result[0].total / Math.pow(10, 6) : 0;
    } catch (error) {
        console.error('Error calculating total platform borrowed amount:', error);
        return 0;
    }
}
