"use client";

import { useState } from "react";
import BuyAssetForm from "./BuyAssetForm";
import SellAssetForm from "./SellAssetForm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import { SAFARICOM_PRICE } from "@/config/constants";

interface TradingInterfaceProps {
  assetName?: string;
  assetPrice?: number;
  userBalance?: number;
}

export default function TradingInterface({ 
  assetName = "Safaricom", 
  assetPrice = SAFARICOM_PRICE,
  userBalance = 0 ,
}: TradingInterfaceProps) {
  const [activeTab, setActiveTab] = useState("buy");
  const { address } = useAccount();
  const params = useParams();

  // Get asset details from URL params if available
  const resolvedAssetName = useMemo(() => {
    return params?.symbol ? String(params.symbol) : assetName;
  }, [params, assetName]);

  const resolvedAssetPrice = useMemo(() => {
    // In a real app, you would fetch the price dynamically based on the asset
    return assetPrice;
  }, [assetPrice]);

  return (
    <div className="card shadow-sm max-w-md w-full mx-auto">
      <Tabs 
        defaultValue="buy" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-2 mb-0 p-0 h-auto">
          <TabsTrigger 
            value="buy" 
            className={`py-3 rounded-none text-sm font-medium ${
              activeTab === "buy" ? "border-b-2 border-[var(--primary)]" : ""
            }`}
          >
            Buy
          </TabsTrigger>
          <TabsTrigger 
            value="sell" 
            className={`py-3 rounded-none text-sm font-medium ${
              activeTab === "sell" ? "border-b-2 border-[var(--danger)]" : ""
            }`}
          >
            Sell
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="buy" className="mt-0 pt-0">
          <BuyAssetForm 
            assetName={resolvedAssetName} 
            assetPrice={resolvedAssetPrice}
          />
        </TabsContent>
        
        <TabsContent value="sell" className="mt-0 pt-0">
          <SellAssetForm 
            assetName={resolvedAssetName} 
            assetPrice={resolvedAssetPrice}
            userBalance={userBalance}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 