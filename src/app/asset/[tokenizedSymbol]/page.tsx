"use client";

import { useParams } from "next/navigation";
import { TrendingUp, TrendingDown, HelpCircle } from "lucide-react";
import { assets, historicalPriceData } from "@/data/marketData";
import { cn } from "@/lib/utils";
import PriceChart from "@/components/assets/PriceChart";
import AssetImage from "@/components/ui/AssetImage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BuyAssetForm from "@/components/trading/BuyAssetForm";
import SellAssetForm from "@/components/trading/SellAssetForm";
import { useAssetPrice } from "@/hooks/usePrices";
import ShareButton from "@/components/ui/ShareButton";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AssetDetailPage() {
  const params = useParams<{ tokenizedSymbol: string }>();
  const tokenizedSymbol = params.tokenizedSymbol;
  const [activeTab, setActiveTab] = useState("buy");

  // Find the asset from our data
  const asset = assets.find((a) => a.tokenizedSymbol === tokenizedSymbol);

  // Fetch price using TanStack Query
  const { data: assetPrice, isLoading } = useAssetPrice(
    asset?.contractAddress || ""
  );
  // console.log(assetPrice);

  // If asset not found, show a message
  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-semibold mb-4">Asset Not Found</h1>
        <p className="text-[var(--secondary)]">
          The asset you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
      </div>
    );
  }

  const isPositive = asset.change >= 0;
  const currentPrice = assetPrice;

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
              <span className="text-xl font-medium">
                KES{" "}
                {currentPrice?.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                {isLoading && (
                  <span className="text-sm text-[var(--secondary)] ml-2">
                    (Updating...)
                  </span>
                )}
              </span>
              <div
                className={cn(
                  "flex items-center gap-1",
                  isPositive ? "text-[var(--success)]" : "text-[var(--danger)]"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {asset.change.toFixed(2)} ({asset.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ShareButton
            url={typeof window !== "undefined" ? window.location.href : ""}
            title={`Check out ${asset.name} (${asset.symbol}) on Hedgehog`}
          />
        </div>
      </div>

      <div className="card px-4 py-3">
        <h2 className="text-xl font-medium pb-2">About {asset.name}</h2>
        <p className="text-[var(--secondary)] py-2">{asset.description}</p>
        
        <TooltipProvider>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 space-y-2 lg:space-y-0 mt-4">
            {/* Tokenization Details */}
            <div className="bg-[var(--card-bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--border-color)]/20 transition-colors p-2 rounded-md relative">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-[var(--secondary)] uppercase tracking-wider">Total Supply</h3>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3 h-3 text-[var(--secondary)]" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The total amount of tokens available in the protocol</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-lg font-medium mt-1">{asset.totalSupply}</p>
            </div>

            <div className="bg-[var(--card-bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--border-color)]/20 transition-colors p-2 rounded-md relative">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-[var(--secondary)] uppercase tracking-wider">Total Borrow</h3>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3 h-3 text-[var(--secondary)]" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The total amount of tokens currently borrowed by users</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-lg font-medium mt-1">{asset.totalBorrow}</p>
            </div>

            <div className="bg-[var(--card-bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--border-color)]/20 transition-colors p-2 rounded-md relative">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-[var(--secondary)] uppercase tracking-wider">Supply APY</h3>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3 h-3 text-[var(--secondary)]" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Annual Percentage Yield for supplying tokens to the protocol</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-lg font-medium mt-1 text-[var(--success)]">{asset.apy.toFixed(1)}%</p>
            </div>

            <div className="bg-[var(--card-bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--border-color)]/20 transition-colors p-2 rounded-md relative">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-[var(--secondary)] uppercase tracking-wider">Utilization Rate</h3>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3 h-3 text-[var(--secondary)]" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The percentage of total supply that is currently borrowed</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-lg font-medium mt-1">{(asset.utilizationRate * 100).toFixed(0)}%</p>
            </div>

            <div className="bg-[var(--card-bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--border-color)]/20 transition-colors p-2 rounded-md relative">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-[var(--secondary)] uppercase tracking-wider">Collateral Factor</h3>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3 h-3 text-[var(--secondary)]" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The maximum percentage of an asset&apos;s value that can be borrowed against it</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-lg font-medium mt-1">{(asset.collateralFactor * 100).toFixed(0)}%</p>
            </div>

            <div className="bg-[var(--card-bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--border-color)]/20 transition-colors p-2 rounded-md relative">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-[var(--secondary)] uppercase tracking-wider">Liquidation Threshold</h3>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3 h-3 text-[var(--secondary)]" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The collateral ratio at which a position becomes eligible for liquidation</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-lg font-medium mt-1">{((asset.collateralFactor - 0.05) * 100).toFixed(0)}%</p>
            </div>
          </div>
        </TooltipProvider>
      </div>

      {/* Asset content */}
      <div className="trading-grid">
        {/* Left column - Charts */}
        <div className="col-span-1 md:col-span-8 space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-sm space-x-2">
              <button className="bracket-btn py-1 text-[var(--primary)]">
                Line Chart
              </button>
              <button className="bracket-btn py-1">Candlestick</button>
            </div>

            <div className="text-sm border border-[var(--border-color)] rounded-md overflow-hidden flex">
              <button className="px-4 py-1.5 bg-[var(--primary)] text-white">
                1D
              </button>
              <button className="px-4 py-1.5 hover:bg-[var(--border-color)]/10">
                1W
              </button>
              <button className="px-4 py-1.5 hover:bg-[var(--border-color)]/10">
                1M
              </button>
              <button className="px-4 py-1.5 hover:bg-[var(--border-color)]/10">
                1Y
              </button>
              <button className="px-4 py-1.5 hover:bg-[var(--border-color)]/10">
                ALL
              </button>
            </div>
          </div>

          <PriceChart data={historicalPriceData} />

          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div> */}

          <div className="card p-4 mt-2">
            <h3 className="text-sm font-medium mb-3">Recent Trades</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--success)]"></div>
                  <span>Buy</span>
                </div>
                <div>500 {asset.tokenizedSymbol || asset.symbol}</div>
                <div>
                  KES{" "}
                  {(asset.price * 500).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className="text-xs text-[var(--secondary)]">
                  5 mins ago
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--danger)]"></div>
                  <span>Sell</span>
                </div>
                <div>1200 {asset.tokenizedSymbol || asset.symbol}</div>
                <div>
                  KES{" "}
                  {(asset.price * 1200).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className="text-xs text-[var(--secondary)]">
                  18 mins ago
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--success)]"></div>
                  <span>Buy</span>
                </div>
                <div>3000 {asset.tokenizedSymbol || asset.symbol}</div>
                <div>
                  KES{" "}
                  {(asset.price * 3000).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className="text-xs text-[var(--secondary)]">
                  42 mins ago
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Trade form */}
        <div className="col-span-1 md:col-span-4">
          <Tabs
            defaultValue="buy"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="border-b border-[var(--border-color)]">
              <TabsList className="w-full h-auto p-0">
                <TabsTrigger
                  value="buy"
                  className={`flex-1 py-4 rounded-none text-sm font-medium ${
                    activeTab === "buy"
                      ? "border-b-2 border-[var(--primary)]"
                      : ""
                  }`}
                >
                  Buy
                </TabsTrigger>
                <TabsTrigger
                  value="sell"
                  className={`flex-1 py-4 rounded-none text-sm font-medium ${
                    activeTab === "sell"
                      ? "border-b-2 border-[var(--danger)]"
                      : ""
                  }`}
                >
                  Sell
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="py-4">
              <TabsContent value="buy" className="mt-0 pt-0">
                <BuyAssetForm
                  assetName={asset.name}
                  assetPrice={asset.price}
                  tokenizedSymbol={asset.tokenizedSymbol}
                />
              </TabsContent>

              <TabsContent value="sell" className="mt-0 pt-0">
                <SellAssetForm
                  assetName={asset.name}
                  assetPrice={asset.price}
                  tokenizedSymbol={asset.tokenizedSymbol}
                  assetContractAddress={asset.contractAddress}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
