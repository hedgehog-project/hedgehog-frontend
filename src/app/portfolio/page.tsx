"use client";

import { useState } from "react";
import { assets } from "@/data/marketData";
import { TrendingUp, TrendingDown, Info, DollarSign, Wallet } from "lucide-react";
import AssetImage from "@/components/ui/AssetImage";
import { cn } from "@/lib/utils";

// Sample user data - in a real app this would come from an API
const userPortfolio = {
  totalValue: 4875600,
  totalDebt: 2016850,
  netWorth: 2858750,
  healthFactor: 3.65,
  supplyPositions: [
    { assetId: "scom", amount: 85000, valueUSD: 1466250, apy: 4.2 },
    { assetId: "eqty", amount: 32500, valueUSD: 1483625, apy: 5.1 },
    { assetId: "kncb", amount: 49800, valueUSD: 1929750, apy: 4.8 },
  ],
  borrowPositions: [
    { assetId: "absa", amount: 120000, valueUSD: 1494000, apy: 3.6 },
    { assetId: "eabl", amount: 3425, valueUSD: 522968, apy: 4.1 },
  ]
};

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Find the assets for the positions
  const supplyAssets = userPortfolio.supplyPositions.map(position => {
    const asset = assets.find(a => a.id === position.assetId);
    return { ...position, asset };
  });
  
  const borrowAssets = userPortfolio.borrowPositions.map(position => {
    const asset = assets.find(a => a.id === position.assetId);
    return { ...position, asset };
  });
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Your Portfolio</h1>
      
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[var(--secondary)]">Total Supply</h3>
            <DollarSign className="w-4 h-4 text-[var(--secondary)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">KES {userPortfolio.totalValue.toLocaleString()}</span>
            <span className="text-xs text-[var(--success)]">+2.4%</span>
          </div>
          <p className="text-xs text-[var(--secondary)] mt-1">Across {userPortfolio.supplyPositions.length} assets</p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[var(--secondary)]">Total Borrow</h3>
            <Wallet className="w-4 h-4 text-[var(--secondary)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">KES {userPortfolio.totalDebt.toLocaleString()}</span>
            <span className="text-xs text-[var(--danger)]">-0.7%</span>
          </div>
          <p className="text-xs text-[var(--secondary)] mt-1">Across {userPortfolio.borrowPositions.length} assets</p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[var(--secondary)]">Health Factor</h3>
            <Info className="w-4 h-4 text-[var(--secondary)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{userPortfolio.healthFactor.toFixed(2)}</span>
            <span className={cn("text-xs", userPortfolio.healthFactor >= 1.5 ? "text-[var(--success)]" : "text-[var(--danger)]")}>
              {userPortfolio.healthFactor >= 1.5 ? "Safe" : "Risky"}
            </span>
          </div>
          <p className="text-xs text-[var(--secondary)] mt-1">Net Worth: KES {userPortfolio.netWorth.toLocaleString()}</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-[var(--border-color)] mb-6">
        <div className="flex space-x-6">
          <button 
            className={cn(
              "pb-3 text-sm font-medium relative",
              activeTab === "overview" ? "text-[var(--primary)]" : "text-[var(--secondary)]"
            )}
            onClick={() => setActiveTab("overview")}
          >
            Overview
            {activeTab === "overview" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]"></div>}
          </button>
          <button 
            className={cn(
              "pb-3 text-sm font-medium relative",
              activeTab === "supply" ? "text-[var(--primary)]" : "text-[var(--secondary)]"
            )}
            onClick={() => setActiveTab("supply")}
          >
            Supply Markets
            {activeTab === "supply" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]"></div>}
          </button>
          <button 
            className={cn(
              "pb-3 text-sm font-medium relative",
              activeTab === "borrow" ? "text-[var(--primary)]" : "text-[var(--secondary)]"
            )}
            onClick={() => setActiveTab("borrow")}
          >
            Borrow Markets
            {activeTab === "borrow" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]"></div>}
          </button>
        </div>
      </div>
      
      {/* Supply Positions */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
          <h2 className="font-medium">Your Supply Positions</h2>
          <button className="bracket-btn py-1">Supply More</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--card-bg-secondary)]">
                <th className="text-left text-xs font-medium text-[var(--secondary)] px-4 py-3">Asset</th>
                <th className="text-right text-xs font-medium text-[var(--secondary)] px-4 py-3">Balance</th>
                <th className="text-right text-xs font-medium text-[var(--secondary)] px-4 py-3">Value (KES)</th>
                <th className="text-right text-xs font-medium text-[var(--secondary)] px-4 py-3">APY</th>
                <th className="text-right text-xs font-medium text-[var(--secondary)] px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {supplyAssets.map((position, index) => (
                <tr key={position.assetId} className="border-b border-[var(--border-color)] last:border-0">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <AssetImage 
                        logoUrl={position.asset?.logoUrl || ''} 
                        symbol={position.asset?.symbol || ''} 
                        size={8} 
                      />
                      <div>
                        <div className="font-medium">{position.asset?.name}</div>
                        <div className="text-xs text-[var(--secondary)]">
                          {position.asset?.symbol}
                          {position.asset?.tokenizedSymbol && (
                            <span className="ml-1 text-[11px] text-[var(--secondary)]/70">
                              {position.asset.tokenizedSymbol}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div>{position.amount.toLocaleString()}</div>
                    <div className="text-xs text-[var(--secondary)]">{position.asset?.symbol}</div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div>KES {position.valueUSD.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="text-[var(--success)]">{position.apy.toFixed(1)}%</div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="bracket-btn py-1">Withdraw</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Borrow Positions */}
      {borrowAssets.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
            <h2 className="font-medium">Your Borrow Positions</h2>
            <button className="bracket-btn py-1">Borrow More</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--card-bg-secondary)]">
                  <th className="text-left text-xs font-medium text-[var(--secondary)] px-4 py-3">Asset</th>
                  <th className="text-right text-xs font-medium text-[var(--secondary)] px-4 py-3">Debt</th>
                  <th className="text-right text-xs font-medium text-[var(--secondary)] px-4 py-3">Value (KES)</th>
                  <th className="text-right text-xs font-medium text-[var(--secondary)] px-4 py-3">APY</th>
                  <th className="text-right text-xs font-medium text-[var(--secondary)] px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowAssets.map((position, index) => (
                  <tr key={position.assetId} className="border-b border-[var(--border-color)] last:border-0">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <AssetImage 
                          logoUrl={position.asset?.logoUrl || ''} 
                          symbol={position.asset?.symbol || ''} 
                          size={8} 
                        />
                        <div>
                          <div className="font-medium">{position.asset?.name}</div>
                          <div className="text-xs text-[var(--secondary)]">
                            {position.asset?.symbol}
                            {position.asset?.tokenizedSymbol && (
                              <span className="ml-1 text-[11px] text-[var(--secondary)]/70">
                                {position.asset.tokenizedSymbol}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div>{position.amount.toLocaleString()}</div>
                      <div className="text-xs text-[var(--secondary)]">{position.asset?.symbol}</div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div>KES {position.valueUSD.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="text-[var(--danger)]">{position.apy.toFixed(1)}%</div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="bracket-btn py-1">Repay</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 