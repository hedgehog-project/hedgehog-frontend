"use client";

import { useState } from "react";
import { assets } from "@/data/marketData";
import { Search, Info, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import AssetImage from "@/components/ui/AssetImage";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Sample user data - in a real app this would come from an API
const userBorrowStats = {
  borrowLimit: 12500,
  totalBorrowed: 3400.75,
  borrowLimitUsed: 0.272, // 27.2%
  netAPY: 1.8
};

export default function BorrowPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("available");
  
  // Filter assets based on search term
  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort assets based on selected criteria
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case "apy":
        return b.borrowApy - a.borrowApy;
      case "available":
        return b.availableToBorrow - a.availableToBorrow;
      case "alphabetical":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Borrow Markets</h1>
      
      {/* Borrow Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[var(--secondary)]">Borrow Limit</h3>
            <Info className="w-4 h-4 text-[var(--secondary)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">${userBorrowStats.borrowLimit.toLocaleString()}</span>
          </div>
          <p className="text-xs text-[var(--secondary)] mt-1">Based on your collateral</p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[var(--secondary)]">Total Borrowed</h3>
            <Info className="w-4 h-4 text-[var(--secondary)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">${userBorrowStats.totalBorrowed.toLocaleString()}</span>
          </div>
          <p className="text-xs text-[var(--secondary)] mt-1">Across all assets</p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[var(--secondary)]">Borrow Limit Used</h3>
            <Info className="w-4 h-4 text-[var(--secondary)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{(userBorrowStats.borrowLimitUsed * 100).toFixed(1)}%</span>
          </div>
          <div className="mt-2 bg-[var(--border-color)] rounded-full h-1.5 w-full">
            <div 
              className={cn(
                "h-full rounded-full",
                userBorrowStats.borrowLimitUsed < 0.7 
                  ? "bg-[var(--success)]" 
                  : userBorrowStats.borrowLimitUsed < 0.9 
                    ? "bg-[var(--warning)]" 
                    : "bg-[var(--danger)]"
              )}
              style={{ width: `${userBorrowStats.borrowLimitUsed * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[var(--secondary)]">Net APY</h3>
            <Info className="w-4 h-4 text-[var(--secondary)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{userBorrowStats.netAPY.toFixed(1)}%</span>
          </div>
          <p className="text-xs text-[var(--secondary)] mt-1">Supply APY - Borrow APY</p>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--secondary)]" size={16} />
          <input
            type="text"
            placeholder="Search assets..."
            className="w-full pl-9 pr-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <button className="bracket-btn flex items-center gap-1">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
          </button>
          
          <div className="relative">
            <button className="bracket-btn flex items-center gap-1">
              <span>Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span>
              <ArrowUpDown className="w-4 h-4" />
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md shadow-lg z-10 hidden">
              <div className="py-1">
                <button 
                  className="block w-full text-left px-4 py-2 hover:bg-[var(--border-color)]/10"
                  onClick={() => setSortBy("available")}
                >
                  Available to Borrow
                </button>
                <button 
                  className="block w-full text-left px-4 py-2 hover:bg-[var(--border-color)]/10"
                  onClick={() => setSortBy("apy")}
                >
                  Borrow APY
                </button>
                <button 
                  className="block w-full text-left px-4 py-2 hover:bg-[var(--border-color)]/10"
                  onClick={() => setSortBy("alphabetical")}
                >
                  Alphabetical
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Assets to Borrow */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)]">
          <h2 className="font-medium">Assets to Borrow</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--card-bg-secondary)]">
                <th className="text-left text-xs font-medium text-[var(--secondary)] px-4 py-3">Asset</th>
                <th className="text-right text-xs font-medium text-[var(--secondary)] px-4 py-3">Available to Borrow</th>
                <th className="text-right text-xs font-medium text-[var(--secondary)] px-4 py-3">Borrow APY</th>
                <th className="text-right text-xs font-medium text-[var(--secondary)] px-4 py-3">Price</th>
                <th className="text-right text-xs font-medium text-[var(--secondary)] px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedAssets.map((asset) => (
                <tr key={asset.id} className="border-b border-[var(--border-color)] last:border-0">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <AssetImage 
                        logoUrl={asset.logoUrl} 
                        symbol={asset.symbol} 
                        size={8} 
                      />
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-xs text-[var(--secondary)]">
                          {asset.symbol}
                          {asset.tokenizedSymbol && (
                            <span className="ml-1 text-[11px] text-[var(--secondary)]/70">
                              {asset.tokenizedSymbol}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div>${asset.availableToBorrow?.toLocaleString() || "0"}</div>
                    <div className="text-xs text-[var(--secondary)]">{(asset.availableToBorrow / asset.price).toFixed(2)} {asset.symbol}</div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="text-[var(--danger)]">{asset.borrowApy?.toFixed(1) || "0.0"}%</div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div>${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className="text-xs text-[var(--secondary)]">
                      {asset.change >= 0 ? 
                        <span className="text-[var(--success)]">+{asset.change.toFixed(2)}%</span> : 
                        <span className="text-[var(--danger)]">{asset.change.toFixed(2)}%</span>
                      }
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link href={`/asset/${asset.id}`} className="bracket-btn py-1">
                      Borrow
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Information Section */}
      <div className="card p-6">
        <h2 className="text-xl font-medium mb-4">About Borrowing</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-2">How Borrowing Works</h3>
            <p className="text-[var(--secondary)] mb-4">
              Hedgehog Protocol allows you to borrow assets against your supplied collateral. Your borrow limit is determined by the value of your supplied assets and their collateral factors.
            </p>
            <ul className="space-y-2 text-[var(--secondary)]">
              <li className="flex items-start gap-2">
                <span className="min-w-5 min-h-5 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs mt-0.5">1</span>
                <span>Supply assets as collateral</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="min-w-5 min-h-5 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs mt-0.5">2</span>
                <span>Borrow up to your borrow limit</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="min-w-5 min-h-5 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs mt-0.5">3</span>
                <span>Maintain a safe health factor to avoid liquidation</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Risk Management</h3>
            <p className="text-[var(--secondary)] mb-4">
              When borrowing, it's important to maintain a healthy position to avoid liquidation. The following factors affect your borrowing risk:
            </p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Health Factor</span>
                  <span>Your buffer before liquidation</span>
                </div>
                <p className="text-xs text-[var(--secondary)]">
                  Keep your health factor above 1.0 to avoid liquidation. The higher, the safer.
                </p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Borrow Limit</span>
                  <span>How much you can borrow</span>
                </div>
                <p className="text-xs text-[var(--secondary)]">
                  Your borrow limit is determined by the value of your collateral and each asset's collateral factor.
                </p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Liquidation</span>
                  <span>When your position becomes risky</span>
                </div>
                <p className="text-xs text-[var(--secondary)]">
                  If your health factor falls below 1.0, your collateral may be liquidated to repay your debt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 