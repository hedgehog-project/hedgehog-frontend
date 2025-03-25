"use server"
import { db } from "../../db";
import { and, desc, eq } from "drizzle-orm";
import * as schema from "../../db/schema";

// Create query builder with consistent interface
const query = {
  assets: {
    findMany: async () => {
      return await db.select().from(schema.assets).all();
    },
    findFirst: async (token: string) => {
      return await db
        .select()
        .from(schema.assets)
        .where(eq(schema.assets.token, token))
        .get();
    }
  },
  prices: {
    findFirst: async (token: string) => {
      return await db
        .select()
        .from(schema.prices)
        .where(eq(schema.prices.token, token))
        .orderBy(desc(schema.prices.timestamp))
        .limit(1)
        .get();
    },
    findMany: async (token: string, limit = 100) => {
      return await db
        .select()
        .from(schema.prices)
        .where(eq(schema.prices.token, token))
        .orderBy(desc(schema.prices.timestamp))
        .limit(limit)
        .all();
    }
  },
  transactions: {
    findManyByAccount: async (account: string) => {
      return await db
        .select()
        .from(schema.transactions)
        .where(eq(schema.transactions.account, account))
        .orderBy(desc(schema.transactions.timestamp))
        .all();
    },
    findManyByToken: async (token: string) => {
      return await db
        .select()
        .from(schema.transactions)
        .where(eq(schema.transactions.token, token))
        .orderBy(desc(schema.transactions.timestamp))
        .all();
    },
    findManyByAccountAndToken: async (account: string, token: string) => {
      return await db
        .select()
        .from(schema.transactions)
        .where(
          and(
            eq(schema.transactions.account, account),
            eq(schema.transactions.token, token)
          )
        )
        .orderBy(desc(schema.transactions.timestamp))
        .all();
    }
  },
  loans: {
    findMany: async (account: string) => {
      return await db
        .select()
        .from(schema.loans)
        .where(eq(schema.loans.account, account))
        .orderBy(desc(schema.loans.timestamp))
        .all();
    },
    findFirst: async (id: string) => {
      return await db
        .select()
        .from(schema.loans)
        .where(eq(schema.loans.id, id))
        .get();
    }
  },
  loanRepayment: {
    findMany: async (loanId: string) => {
      return await db
        .select()
        .from(schema.loanRepayment)
        .where(eq(schema.loanRepayment.loanId, loanId))
        .orderBy(desc(schema.loanRepayment.timestamp))
        .all();
    }
  },
  liquidations: {
    findMany: async (loanId: string) => {
      return await db
        .select()
        .from(schema.liquidations)
        .where(eq(schema.liquidations.loanId, loanId))
        .orderBy(desc(schema.liquidations.timestamp))
        .all();
    }
  },
  providedLiquidity: {
    findMany: async (account: string) => {
      return await db
        .select()
        .from(schema.providedLiquidity)
        .where(eq(schema.providedLiquidity.account, account))
        .orderBy(desc(schema.providedLiquidity.timestamp))
        .all();
    }
  },
  withdrawnLiquidity: {
    findMany: async (account: string) => {
      return await db
        .select()
        .from(schema.withdrawnLiquidity)
        .where(eq(schema.withdrawnLiquidity.account, account))
        .orderBy(desc(schema.withdrawnLiquidity.timestamp))
        .all();
    }
  },
  lendingReserves: {
    findMany: async () => {
      return await db
        .select()
        .from(schema.lendingReserves)
        .all();
    }
  },
  kyc: {
    findFirst: async (account: string, token: string) => {
      return await db
        .select()
        .from(schema.kyc)
        .where(
          and(
            eq(schema.kyc.account, account),
            eq(schema.kyc.token, token)
          )
        )
        .get();
    }
  },
  realworldAssetTimeseries: {
    findMany: async (asset: string, limit = 100) => {
      return await db
        .select()
        .from(schema.realwordAssetTimeseries)
        .where(eq(schema.realwordAssetTimeseries.asset, asset))
        .orderBy(desc(schema.realwordAssetTimeseries.timestamp))
        .limit(limit)
        .all();
    }
  }
};

// Asset-related functions
export async function getAllAssets() {
  return await query.assets.findMany();
}

export async function getAssetByToken(token: string) {
  return await query.assets.findFirst(token);
}

// Price-related functions
export async function getLatestPrice(token: string) {
  return await query.prices.findFirst(token);
}

export async function getPriceHistory(token: string, limit = 100) {
  return await query.prices.findMany(token, limit);
}

// Transaction-related functions
export async function getTransactionsByAccount(account: string) {
  return await query.transactions.findManyByAccount(account);
}

export async function getTransactionsByToken(token: string) {
  return await query.transactions.findManyByToken(token);
}

export async function getTransactionsByAccountAndToken(account: string, token: string) {
  return await query.transactions.findManyByAccountAndToken(account, token);
}

// Portfolio-related functions (derived from transactions)
export async function getUserPortfolio(account: string) {
  const transactions = await query.transactions.findManyByAccount(account);
  
  // Group by token and calculate balances
  const portfolio = new Map<string, number>();
  
  for (const tx of transactions) {
    const currentBalance = portfolio.get(tx.token) || 0;
    if (tx.type === "deposit" || tx.type === "receive") {
      portfolio.set(tx.token, currentBalance + tx.amount);
    } else if (tx.type === "withdraw" || tx.type === "send") {
      portfolio.set(tx.token, currentBalance - tx.amount);
    }
  }
  
  // Convert to array format
  return Array.from(portfolio.entries()).map(([token, amount]) => ({
    token,
    amount,
  }));
}

// Loan-related functions
export async function getUserLoans(account: string) {
  return await query.loans.findMany(account);
}

export async function getLoanById(id: string) {
  return await query.loans.findFirst(id);
}

export async function getLoanRepayments(loanId: string) {
  return await query.loanRepayment.findMany(loanId);
}

export async function getLoanLiquidations(loanId: string) {
  return await query.liquidations.findMany(loanId);
}

// Liquidity-related functions
export async function getUserProvidedLiquidity(account: string) {
  return await query.providedLiquidity.findMany(account);
}

export async function getUserWithdrawnLiquidity(account: string) {
  return await query.withdrawnLiquidity.findMany(account);
}

export async function getLendingReserves() {
  return await query.lendingReserves.findMany();
}

// KYC check function
export async function isUserKycVerified(account: string, token: string) {
  const result = await query.kyc.findFirst(account, token);
  return !!result;
}

// Real-world asset time series data
export async function getRealWorldAssetData(asset: string, limit = 100) {
  return await query.realworldAssetTimeseries.findMany(asset, limit);
}

interface TimeSeriesQuery {
    slotSpan?: '10s' | "1min" | "1h" | "1d" | "1w" | "1m" | "1y",
    start: number,
    end: number,
    asset: string
}

export async function getTimeSeriesData(query: TimeSeriesQuery) {
    const { asset, start, end, slotSpan = '1min' } = query;
    const data = await db.query.realwordAssetTimeseries.findMany({
        where(fields, ops) {
            return ops.and(
                ops.eq(fields.asset, asset),
                ops.gte(fields.timestamp, start),
                ops.lte(fields.timestamp, end),
            )
        },
    })

    const slot_seconds  = slotSpan === '10s' ? 10 :
                            slotSpan === '1min' ? 60 :
                            slotSpan === '1h' ? 3600 :
                            slotSpan === '1d' ? 86400 :
                            slotSpan === '1w' ? 604800 :
                            slotSpan === '1m' ? 2592000 :
                            slotSpan === '1y' ? 31536000 : 60;

    const slotCount = (end - start) / slot_seconds;

    const slots = Array.from({ length: slotCount }, (_, i) => {
        const slotStart = start + i * slot_seconds;
        const slotEnd = slotStart + slot_seconds;

        const slotData = data.filter(d => d.timestamp >= slotStart && d.timestamp < slotEnd);

        const slotOpen = slotData[0]?.open || 0;
        const slotClose = slotData[slotData.length - 1]?.close || 0;
        const slotHigh = Math.max(...slotData.map(d => d.high));
        const slotLow = Math.min(...slotData.map(d => d.low));

        const slotVolume = slotData.reduce((acc, d) => acc + (d.high + d.close) / 2, 0);

        return {
            timestamp: slotStart,
            open: slotOpen,
            close: slotClose,
            high: slotHigh,
            low: slotLow,
            volume: slotVolume
        }
    });

    return slots;
}   
