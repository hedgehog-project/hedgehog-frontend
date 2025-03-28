'use server';

import { db } from "@/db";
import { loans } from "@/db/schema";
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
