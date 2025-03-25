"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { ISSUER_CONTRACT_ADDRESS } from "@/config/contracts";
import issuerABI from "@/abi/Issuer.json";
import BuyAssetForm from "@/components/trading/BuyAssetForm";
import SellAssetForm from "@/components/trading/SellAssetForm";
import { formatAddress } from "@/lib/wagmi";

interface Asset {
  name: string;
  price: number;
  totalSupply: number;
  availability: number;
  description: string;
  imageUrl: string;
}

export default function TradeIndexPage() {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();

  // Fetch available assets - mock data for now
  const { data: assetNames, isLoading: isLoadingAssets } = useReadContract({
    address: formatAddress(ISSUER_CONTRACT_ADDRESS),
    abi: issuerABI,
    functionName: "getAvailableAssets",
  });

  // Fetch user balance for selected asset
  const { data: userBalance, refetch: refetchBalance } = useReadContract({
    address: formatAddress(ISSUER_CONTRACT_ADDRESS),
    abi: issuerABI,
    functionName: "getTokenBalance",
    args: selectedAsset && address ? [selectedAsset, address] : undefined,
  });

  // Load asset details
  useEffect(() => {
    const loadAssetDetails = async () => {
      // For now we'll use mock data since we don't have full contract interaction yet
      setLoading(true);
      
      try {
        // Mock asset data - in a real app, you would fetch this from the contract
        const assetData: Asset[] = [
          {
            name: "hhSAF",
            price: 42, // TUSDC
            totalSupply: 10000,
            availability: 5000,
            description: "Tokenized Safaricom shares on Hedgehog Protocol",
            imageUrl: "/assets/safaricom-logo.png"
          }
        ];
        
        setAssets(assetData);
        
        // Set the first asset as selected by default
        if (!selectedAsset && assetData.length > 0) {
          setSelectedAsset(assetData[0].name);
        }
      } catch (error) {
        console.error("Error loading asset details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAssetDetails();
  }, [assetNames, selectedAsset]);

  // Get the currently selected asset
  const currentAsset = assets.find(asset => asset.name === selectedAsset);

  return (
    <section className="py-10 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[var(--primary-blue)] to-transparent opacity-30"></div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--primary-blue)] to-transparent opacity-30"></div>
        <div className="grid grid-cols-8 h-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`v-${i}`} className="border-r border-[var(--border-color)] h-full"></div>
          ))}
        </div>
        <div className="grid grid-rows-8 h-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`h-${i}`} className="border-b border-[var(--border-color)] w-full"></div>
          ))}
        </div>
      </div>

      <div className="container max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 text-center leading-tight">
          <span className="gradient-text">Trade Tokenized Assets</span>
        </h1>

        {loading || isLoadingAssets ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--primary-blue)]" />
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-xl mb-2">No Assets Available</h3>
            <p className="text-[var(--secondary)]">There are currently no tokenized assets available for trading.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1">
              <div className="card">
                <div className="p-4 border-b border-[var(--border-color)]">
                  <h2 className="font-bold">Available Assets</h2>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {assets.map((asset) => (
                      <li key={asset.name}>
                        <button
                          onClick={() => setSelectedAsset(asset.name)}
                          className={`w-full text-left p-3 rounded-md transition-colors ${
                            selectedAsset === asset.name
                              ? "bg-[var(--primary-blue)]/10 border border-[var(--primary-blue)]/30"
                              : "hover:bg-[var(--border-color)]/20"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[var(--card-bg)] rounded-full flex items-center justify-center">
                              {asset.imageUrl ? (
                                <img src={asset.imageUrl} alt={asset.name} className="w-6 h-6" />
                              ) : (
                                <span className="text-xs font-mono">{asset.name.substring(0, 2)}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{asset.name}</div>
                              <div className="text-xs text-[var(--secondary)]">
                                {asset.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              {currentAsset && (
                <>
                  <div className="card mb-6">
                    <div className="p-4 border-b border-[var(--border-color)]">
                      <div className="flex justify-between items-center">
                        <h2 className="font-bold flex items-center gap-2">
                          {currentAsset.imageUrl && (
                            <img src={currentAsset.imageUrl} alt={currentAsset.name} className="w-5 h-5" />
                          )}
                          {currentAsset.name}
                        </h2>
                        <span className="text-sm font-medium">
                          TUSDC {currentAsset.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="mb-4">
                        <p className="text-sm">{currentAsset.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-[var(--border-color)]/10 rounded-md">
                          <div className="text-sm text-[var(--secondary)]">Total Supply</div>
                          <div className="font-medium">{currentAsset.totalSupply.toLocaleString()}</div>
                        </div>
                        <div className="p-3 bg-[var(--border-color)]/10 rounded-md">
                          <div className="text-sm text-[var(--secondary)]">Available</div>
                          <div className="font-medium">{currentAsset.availability.toLocaleString()}</div>
                        </div>
                        {address && (
                          <div className="p-3 bg-[var(--border-color)]/10 rounded-md">
                            <div className="text-sm text-[var(--secondary)]">Your Balance</div>
                            <div className="font-medium">
                              {userBalance !== undefined
                                ? Number(userBalance).toLocaleString()
                                : <Loader2 className="h-4 w-4 animate-spin inline" />}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Tabs defaultValue="buy">
                    <TabsList className="w-full mb-6">
                      <TabsTrigger value="buy" className="flex-1">Buy</TabsTrigger>
                      <TabsTrigger value="sell" className="flex-1">Sell</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="buy">
                      <BuyAssetForm
                        assetName={currentAsset.name}
                        assetPrice={currentAsset.price}
                      />
                    </TabsContent>
                    
                    <TabsContent value="sell">
                      <SellAssetForm
                        assetName={currentAsset.name}
                        assetPrice={currentAsset.price}
                        userBalance={userBalance ? Number(userBalance) : 0}
                      />
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
} 