"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, BookOpen, Share2, Bell } from "lucide-react";
import { SAFARICOM_PRICE, SAFARICOM_SYMBOL } from "@/config/constants";
import { useReadContract } from "wagmi";
import { ISSUER_CONTRACT_ADDRESS, TUSDC_TOKEN_ADDRESS } from "@/config/contracts";
import issuerABI from "@/abi/Issuer.json";
import { useAccount } from "wagmi";
import { formatAddress } from "@/lib/wagmi";
import { cn } from "@/lib/utils";
import TradingInterface from "@/components/trading/TradingInterface";
import { Abi } from "viem";


export default function TradePage() {
  const params = useParams();
  const { address } = useAccount();
  const [userBalance, setUserBalance] = useState(0);
  
  const symbol = params?.symbol ? String(params.symbol) : SAFARICOM_SYMBOL;
  // const assetName = symbol.startsWith("hh") ? symbol.substring(2) : symbol;
  const assetName = "Safaricom";
  console.log(assetName);
  const tusdcAddress = TUSDC_TOKEN_ADDRESS as `0x${string}`;
  console.log(tusdcAddress);

 

  // Get asset price from smart contract (fallback to constant if unavailable)
  // const { data: assetPrice } = useReadContract({
  //   address: formatAddress(ISSUER_CONTRACT_ADDRESS),
  //   abi: issuerABI.abi as Abi,
  //   functionName: "getAssetPrice",
  //   args: [assetName],
  // });

  const assetPrice = 10;

  // Get user token balance
  const { data: tokenBalance } = useReadContract({
    address: formatAddress(ISSUER_CONTRACT_ADDRESS),
    abi: issuerABI.abi as Abi,
    functionName: "getTokenBalance",
    args: address ? [assetName, address] : undefined,
  });



  // Update user balance when data changes
  useEffect(() => {
    if (tokenBalance) {
      setUserBalance(Number(tokenBalance));
    }
  }, [tokenBalance]);

  const resolvedPrice = assetPrice ? Number(assetPrice) : SAFARICOM_PRICE;
  const change = 1.2; // Placeholder for price change
  const isPositive = change >= 0;

 

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Asset header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
            <span className="text-[var(--primary)] font-bold">{symbol}</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-3">
              {assetName} 
              <span className="text-lg text-[var(--secondary)]">
                ({symbol})
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-medium">TUSDC {resolvedPrice.toLocaleString()}</span>
              <div className={cn(
                "flex items-center gap-1",
                isPositive ? "text-[var(--success)]" : "text-[var(--danger)]"
              )}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isPositive ? "+" : ""}{change.toFixed(2)} ({(change/resolvedPrice * 100).toFixed(2)}%)</span>
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left column - Charts and info */}
        <div className="col-span-1 md:col-span-8 space-y-6">
          {/* Chart placeholder */}
          <div className="card p-4 h-64 flex items-center justify-center bg-[var(--border-color)]/10">
            <p className="text-[var(--secondary)]">Price chart coming soon</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4">
              <h3 className="text-sm font-medium text-[var(--secondary)] mb-1">Market Cap</h3>
              <p className="text-lg font-medium">TUSDC 10,000,000</p>
            </div>
            <div className="card p-4">
              <h3 className="text-sm font-medium text-[var(--secondary)] mb-1">24h Volume</h3>
              <p className="text-lg font-medium">TUSDC 250,000</p>
            </div>
            <div className="card p-4">
              <h3 className="text-sm font-medium text-[var(--secondary)] mb-1">Your Balance</h3>
              <p className="text-lg font-medium">{userBalance.toLocaleString()} {symbol}</p>
            </div>
          </div>
          
          <div className="card p-6">
            <h2 className="text-xl font-medium mb-6">About {assetName}</h2>
            <p className="text-[var(--secondary)] mb-4">
              {assetName} is a leading company in telecommunications and mobile money in East Africa. The tokenized shares on Hedgehog Protocol are backed 1:1 by real shares held in reserve.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Tokenization Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--secondary)]">Total Supply</span>
                    <span>1,000,000 {symbol}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--secondary)]">Available Supply</span>
                    <span>500,000 {symbol}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--secondary)]">Token Standard</span>
                    <span>HRC-20</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Market Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--secondary)]">Price</span>
                    <span>TUSDC {resolvedPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--secondary)]">Market Cap</span>
                    <span>TUSDC 10,000,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--secondary)]">24h Trading Volume</span>
                    <span>TUSDC 250,000</span>
                  </div>
                 
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Trading interface */}
        <div className="col-span-1 md:col-span-4">
          <TradingInterface 
            assetName={assetName} 
            assetPrice={resolvedPrice}
            userBalance={userBalance}
          />
          
          <div className="card p-4 mt-6">
            <h3 className="text-sm font-medium mb-3">Recent Transactions</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--success)]"></div>
                  <span>Buy</span>
                </div>
                <div>100 {symbol}</div>
                <div>TUSDC {(resolvedPrice * 100).toLocaleString()}</div>
                <div className="text-xs text-[var(--secondary)]">2 mins ago</div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--danger)]"></div>
                  <span>Sell</span>
                </div>
                <div>50 {symbol}</div>
                <div>TUSDC {(resolvedPrice * 50).toLocaleString()}</div>
                <div className="text-xs text-[var(--secondary)]">5 mins ago</div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--success)]"></div>
                  <span>Buy</span>
                </div>
                <div>200 {symbol}</div>
                <div>TUSDC {(resolvedPrice * 200).toLocaleString()}</div>
                <div className="text-xs text-[var(--secondary)]">10 mins ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 