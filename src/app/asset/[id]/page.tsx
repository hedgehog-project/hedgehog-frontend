"use client";

import { useParams } from "next/navigation";
import { TrendingUp, TrendingDown, BookOpen, Share2, Bell } from "lucide-react";
import { assets, historicalPriceData } from "@/data/marketData";
import { cn } from "@/lib/utils";
import PriceChart from "@/components/assets/PriceChart";
import TradeForm from "@/components/assets/TradeForm";
import AssetImage from "@/components/ui/AssetImage";

export default function AssetDetailPage() {
  const params = useParams<{ id: string }>();
  const assetId = params.id;
  
  // Find the asset from our data
  const asset = assets.find(a => a.id === assetId);
  
  // If asset not found, show a message
  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-semibold mb-4">Asset Not Found</h1>
        <p className="text-[var(--secondary)]">The asset you&apos;re looking for doesn&apos;t exist or has been removed.</p>
      </div>
    );
  }
  
  const isPositive = asset.change >= 0;
  
  return (
    <div className="space-y-8">
      {/* Asset header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <AssetImage logoUrl={asset.logoUrl} symbol={asset.symbol} size={12} />
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-3">
              {asset.name} 
              <span className="text-lg text-[var(--secondary)]">
                ({asset.symbol})
                {asset.tokenizedSymbol && (
                  <span className="ml-1 text-sm text-[var(--secondary)]/70">
                    {asset.tokenizedSymbol}
                  </span>
                )}
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-medium">KES {asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <div className={cn(
                "flex items-center gap-1",
                isPositive ? "text-[var(--success)]" : "text-[var(--danger)]"
              )}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isPositive ? "+" : ""}{asset.change.toFixed(2)} ({asset.changePercent.toFixed(2)}%)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="bracket-btn">
            <BookOpen className="w-4 h-4" />
            <span>Docs</span>
          </button>
          <button className="bracket-btn">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button className="bracket-btn">
            <Bell className="w-4 h-4" />
            <span>Alert</span>
          </button>
        </div>
      </div>
      
      {/* Asset content */}
      <div className="trading-grid">
        {/* Left column - Charts */}
        <div className="col-span-1 md:col-span-8 space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-sm space-x-2">
              <button className="bracket-btn py-1 text-[var(--primary)]">Line Chart</button>
              <button className="bracket-btn py-1">Candlestick</button>
            </div>
            
            <div className="text-sm border border-[var(--border-color)] rounded-md overflow-hidden flex">
              <button className="px-4 py-1.5 bg-[var(--primary)] text-white">1D</button>
              <button className="px-4 py-1.5 hover:bg-[var(--border-color)]/10">1W</button>
              <button className="px-4 py-1.5 hover:bg-[var(--border-color)]/10">1M</button>
              <button className="px-4 py-1.5 hover:bg-[var(--border-color)]/10">1Y</button>
              <button className="px-4 py-1.5 hover:bg-[var(--border-color)]/10">ALL</button>
            </div>
          </div>
          
          <PriceChart data={historicalPriceData} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4">
              <h3 className="text-sm font-medium text-[var(--secondary)] mb-1">Market Cap</h3>
              <p className="text-lg font-medium">{asset.marketCap}</p>
            </div>
            <div className="card p-4">
              <h3 className="text-sm font-medium text-[var(--secondary)] mb-1">24h Volume</h3>
              <p className="text-lg font-medium">{asset.volume}</p>
            </div>
            <div className="card p-4">
              <h3 className="text-sm font-medium text-[var(--secondary)] mb-1">Collateral Factor</h3>
              <p className="text-lg font-medium">{(asset.collateralFactor * 100).toFixed(0)}%</p>
            </div>
          </div>
          
          <div className="card p-6">
            <h2 className="text-xl font-medium mb-6">About {asset.name}</h2>
            <p className="text-[var(--secondary)] mb-4">
              {asset.name} is a leading company in {asset.categories.join(" and ")}. The tokenized shares on Hedgehog Protocol are backed 1:1 by real shares held in reserve by the Nairobi Securities Exchange (NSE).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Tokenization Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--secondary)]">Total Supply</span>
                    <span>{asset.totalSupply}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--secondary)]">Total Borrow</span>
                    <span>{asset.totalBorrow}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--secondary)]">Utilization Rate</span>
                    <span>{(asset.utilizationRate * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Lending Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--secondary)]">Supply APY</span>
                    <span className="text-[var(--success)]">{asset.apy.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--secondary)]">Collateral Factor</span>
                    <span>{(asset.collateralFactor * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--secondary)]">Liquidation Threshold</span>
                    <span>{((asset.collateralFactor - 0.05) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Trade form */}
        <div className="col-span-1 md:col-span-4">
          <TradeForm 
            symbol={asset.symbol} 
            tokenizedSymbol={asset.tokenizedSymbol}
            price={asset.price} 
          />
          
          <div className="card p-4 mt-6">
            <h3 className="text-sm font-medium mb-3">Recent Trades</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--success)]"></div>
                  <span>Buy</span>
                </div>
                <div>500 {asset.tokenizedSymbol || asset.symbol}</div>
                <div>KES {(asset.price * 500).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                <div className="text-xs text-[var(--secondary)]">5 mins ago</div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--danger)]"></div>
                  <span>Sell</span>
                </div>
                <div>1200 {asset.tokenizedSymbol || asset.symbol}</div>
                <div>KES {(asset.price * 1200).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                <div className="text-xs text-[var(--secondary)]">18 mins ago</div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--success)]"></div>
                  <span>Buy</span>
                </div>
                <div>3000 {asset.tokenizedSymbol || asset.symbol}</div>
                <div>KES {(asset.price * 3000).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                <div className="text-xs text-[var(--secondary)]">42 mins ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 