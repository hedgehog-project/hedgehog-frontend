"use client";

import { useState } from "react";
import { Info, DollarSign, Wallet, ArrowRight } from "lucide-react";
import AssetImage from "@/components/ui/AssetImage";
import { cn } from "@/lib/utils";
import { useAccount, useBalance } from "wagmi";
import { KES_TOKEN_ADDRESS } from "@/config/contracts";
import { assets } from "@/data/marketData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import WithdrawForm from "@/components/lending/WithdrawForm";
import RepayForm from "@/components/lending/RepayForm";
import { formatUSDC } from "@/lib/utils";
import {
  useMarketsProvidedLiquidityByAccount,
  useTotalProvidedLiquidityByAccount,
} from "@/hooks/useProvidedLiquidity";
import Image from "next/image";
import { useLoans, useTotalLoanAmount } from "@/hooks/useTotalLoanAmount";

// Constants
// const USD_TO_KES_RATE = 129;

// Sample user data - in a real app this would come from an API
const userPortfolio = {
  totalValue: 48756, // in USDC
  totalDebt: 20168.5, // in USDC
  netWorth: 28587.5, // in USDC
  healthFactor: 3.65,
  supplyPositions: [
    {
      assetId: "scom",
      contractAddress: "0x000000000000000000000000000000000058162d",
      amount: 85000,
      valueUSD: 14662.5,
      apy: 4.2,
    },
    {
      assetId: "eqty",
      contractAddress: "0x0000000000000000000000000000000000582c35",
      amount: 32500,
      valueUSD: 14836.25,
      apy: 5.1,
    },
  ],
  borrowPositions: [
    { assetId: "absa", amount: 120000, valueUSD: 14940.0, apy: 3.6 },
    { assetId: "eabl", amount: 3425, valueUSD: 5229.68, apy: 4.1 },
  ],
};

interface SupplyPosition {
  id: string;
  assetAddress: string;
  amount: number;
  account: string;
  timestamp: number;
  asset?: {
    contractAddress: string;
    name: string;
    symbol: string;
    logoUrl: string;
    tokenizedSymbol?: string;
    price: number;
    apy: number;
  };
  valueUSD: number;
}

interface Loan {
  id: string;
  account: string;
  collateralAsset: string;
  loanAmountUSDC: number;
  collateralAmount: number;
  liquidationPrice: number;
  repaymentAmount: number;
  timestamp: number;
}

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState("supply");
  // const [showKesValue, setShowKesValue] = useState(false);
  const [isWithdrawSheetOpen, setIsWithdrawSheetOpen] = useState(false);
  const [isRepaySheetOpen, setIsRepaySheetOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<{
    contractAddress: string;
    name: string;
    symbol: string;
  } | null>(null);
  const { address } = useAccount();
  const router = useRouter();

  // Get TUSDC balance
  const { data: kesBalance } = useBalance({
    address: address,
    token: KES_TOKEN_ADDRESS as `0x${string}`,
  });



  // Get balances for each asset individually
  const scomBalance = useBalance({
    address: address,
    token: assets[0].contractAddress as `0x${string}`,
  });
  const eqtyBalance = useBalance({
    address: address,
    token: assets[1].contractAddress as `0x${string}`,
  });
  const kqBalance = useBalance({
    address: address,
    token: assets[2].contractAddress as `0x${string}`,
  });
  const kcbBalance = useBalance({
    address: address,
    token: assets[3].contractAddress as `0x${string}`,
  });
  const absaBalance = useBalance({
    address: address,
    token: assets[4].contractAddress as `0x${string}`,
  });
  const eablBalance = useBalance({
    address: address,
    token: assets[5].contractAddress as `0x${string}`,
  });
  const coopBalance = useBalance({
    address: address,
    token: assets[6].contractAddress as `0x${string}`,
  });
  const bambBalance = useBalance({
    address: address,
    token: assets[7].contractAddress as `0x${string}`,
  });

  // Combine balances with asset data
  const assetBalances = [
    { ...assets[0], balance: scomBalance.data?.value || BigInt(0) },
    { ...assets[1], balance: eqtyBalance.data?.value || BigInt(0) },
    { ...assets[2], balance: kqBalance.data?.value || BigInt(0) },
    { ...assets[3], balance: kcbBalance.data?.value || BigInt(0) },
    { ...assets[4], balance: absaBalance.data?.value || BigInt(0) },
    { ...assets[5], balance: eablBalance.data?.value || BigInt(0) },
    { ...assets[6], balance: coopBalance.data?.value || BigInt(0) },
    { ...assets[7], balance: bambBalance.data?.value || BigInt(0) },
  ];

  // Filter assets with non-zero balances
  const assetsWithBalance = assetBalances.filter(
    (asset) => asset.balance > BigInt(0)
  );

  // Format TUSDC balance in USD
  const formattedkesBalance = kesBalance
    ? (Number(kesBalance.value) / 1e6).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  // // Calculate TUSDC value in KES
  // const tusdcValueInKes = kesBalance
  //   ? ((Number(kesBalance.value) / 1e6) * USD_TO_KES_RATE).toLocaleString(
  //       undefined,
  //       { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  //     )
  //   : "0.00";

  // Format asset balances
  const formatAssetBalance = (balance: bigint) => {
    return Number(balance).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const {
    data: totalProvidedLiquidity,
    isLoading: isTotalProvidedLiquidityLoading,
  } = useTotalProvidedLiquidityByAccount(address as `0x${string}`);

  const { data: marketsProvidedLiquidityData } =
    useMarketsProvidedLiquidityByAccount(address as `0x${string}`);

  console.log(marketsProvidedLiquidityData);

  const { data: loansData } = useLoans(address as `0x${string}`);

  console.log(loansData);

  const { data: totalLoanAmount, isLoading: isTotalLoanAmountLoading } = useTotalLoanAmount(address as `0x${string}`);

  console.log(totalLoanAmount);

  // Find the assets for the positions and combine amounts for same asset
  const supplyAssets =
    marketsProvidedLiquidityData?.reduce((acc, position) => {
      const asset = assets?.find((a) => a.contractAddress === position.asset);
      if (!asset) return acc;

      // Find if we already have this asset in our accumulator
      const existingPosition = acc.find(
        (p) => p.assetAddress === position.asset
      );

      if (existingPosition) {
        // Update existing position with combined amount
        existingPosition.amount += position.amount;
        existingPosition.valueUSD =
          (existingPosition.amount / Math.pow(10, 6)) * asset.price;
      } else {
        // Add new position
        acc.push({
          id: position.id,
          assetAddress: position.asset,
          amount: position.amount,
          account: position.account,
          timestamp: position.timestamp,
          asset,
          valueUSD: (position.amount / Math.pow(10, 6)) * asset.price,
        });
      }

      return acc;
    }, [] as SupplyPosition[]) || [];

  console.log(supplyAssets);

  const borrowAssets = userPortfolio.borrowPositions.map((position) => {
    const asset = assets.find((a) => a.id === position.assetId);
    return { ...position, asset };
  });

  const getUniqueCollateralAssetsCount = (loans: Loan[] | undefined) => {
    if (!loans) return 0;
    return new Set(loans.map(loan => loan.collateralAsset)).size;
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Your Portfolio</h1>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        {/* Left Column - Portfolio Overview */}
        <div className="h-full">
          <div className="card p-6 h-full">
            <h2 className="text-lg font-semibold mb-4">Portfolio Overview</h2>
            <div className="space-y-4">
              <div className="p-4 bg-[var(--border-color)]/10 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[var(--success)]" />
                    <span className="font-medium">Total Supply Value</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      $ {/* ${formatUSDC(totalPortfolioValue)} */}
                      {isTotalProvidedLiquidityLoading ? (
                        <p>0.00</p>
                      ) : totalProvidedLiquidity ? (
                        formatUSDC(totalProvidedLiquidity)
                      ) : (
                        "0.00"
                      )}
                    </div>
                    <div className="text-xs text-[var(--success)]">+2.4%</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-[var(--secondary)]">
                    Across {assetsWithBalance.length} asset
                    {assetsWithBalance.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[var(--border-color)]/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-[var(--danger)]" />
                    <span className="font-medium">Total Borrow</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {isTotalLoanAmountLoading ? (
                        <p>$ 0.00</p>
                      ) : totalLoanAmount ? (
                        "$ " + formatUSDC(totalLoanAmount)
                      ) : (
                        "$ 0.00"
                      )}
                    </div>
                    <div className="text-xs text-[var(--danger)]">-0.7%</div>
                  </div>
                </div>
                <p className="text-sm text-[var(--secondary)]">
                  Across {getUniqueCollateralAssetsCount(loansData)} assets
                </p>
              </div>

              <div className="p-4 bg-[var(--border-color)]/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-[var(--primary)]" />
                    <span className="font-medium">Health Factor</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {userPortfolio.healthFactor.toFixed(2)}
                    </div>
                    <div
                      className={cn(
                        "text-xs",
                        userPortfolio.healthFactor >= 1.5
                          ? "text-[var(--success)]"
                          : "text-[var(--danger)]"
                      )}
                    >
                      {userPortfolio.healthFactor >= 1.5 ? "Safe" : "Risky"}
                    </div>
                  </div>
                </div>
              
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Asset Balances */}
        <div className="h-full">
          <div className="card p-6 h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Your Asset Balances</h2>

            {/* TUSDC Balance at the top */}
            <div className="mb-4 pb-4 border-b border-[var(--border-color)]">
              <div className="p-4 bg-[var(--border-color)]/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">KES</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {kesBalance === undefined ? (
                      <p>0.00</p>
                    ) : (
                      <span className="text-lg font-semibold">
                        {formattedkesBalance}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-[var(--secondary)]">
                      Available for trading
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Balances below */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {assetsWithBalance.map((asset) => (
                <div
                  key={asset.id}
                  className="p-4 bg-[var(--border-color)]/10 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AssetImage
                        logoUrl={asset.logoUrl}
                        symbol={asset.symbol}
                        size={8}
                      />
                      <span className="font-medium">
                        {asset.tokenizedSymbol}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {formatAssetBalance(asset.balance)}
                      </div>
                      <div className="text-xs text-[var(--success)]">
                        ${formatUSDC(Number(asset.balance) * asset.price)}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--secondary)]">
                    Price: ${formatUSDC(asset.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="supply"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="border-b border-[var(--border-color)]">
          <TabsList className="inline-flex h-auto p-0 mx-auto">
            <TabsTrigger
              value="supply"
              className={`px-6 py-4 rounded-none text-sm font-medium ${
                activeTab === "supply"
                  ? "border-b-2 border-[var(--primary)]"
                  : ""
              }`}
            >
              Supply Markets
            </TabsTrigger>
            <TabsTrigger
              value="borrow"
              className={`px-6 py-4 rounded-none text-sm font-medium ${
                activeTab === "borrow"
                  ? "border-b-2 border-[var(--primary)]"
                  : ""
              }`}
            >
              Borrow Markets
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="py-4">
          <TabsContent value="supply" className="mt-0 pt-0">
            {/* Supply Positions */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
                <h2 className="font-medium">Your Supply Positions</h2>
                <button
                  onClick={() => router.push("/lend")}
                  className="flex items-center gap-2 text-sm hover:text-[var(--primary)] hover:underline py-1"
                >
                  Supply More
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-color)]">
                      <th className="px-4 py-4 text-left">Asset</th>
                      <th className="px-4 py-4 text-right">Amount</th>
                      <th className="px-4 py-4 text-right">Value (USD)</th>
                      <th className="px-4 py-4 text-right">APY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplyAssets.map((position) => (
                      <tr
                        key={position.id}
                        className="border-b border-[var(--border-color)] last:border-0"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Image
                              src={position.asset?.logoUrl || ""}
                              alt={position.asset?.symbol || ""}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                            <span>{position.asset?.symbol || ""}</span>
                            <span>{position.asset?.tokenizedSymbol || ""}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {formatUSDC(position.amount / Math.pow(10, 6))}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {formatUSDC(position.valueUSD)}
                        </td>
                        <td className="px-4 py-4 text-right text-[var(--primary)]">
                          {position.asset?.apy
                            ? `${(position.asset.apy).toFixed(2)}%`
                            : "N/A"}
                        </td>
                        {/* Add a button to withdraw */}
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedAsset({
                                contractAddress: position.asset?.contractAddress || "",
                                name: position.asset?.name || "",
                                symbol: position.asset?.symbol || "",
                              });
                              setIsWithdrawSheetOpen(true);
                            }}
                            className="cursor-pointer px-4 py-1 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white"
                          >
                            Withdraw
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="borrow" className="mt-0 pt-0">
            {/* Borrow Positions */}
            {borrowAssets.length > 0 && (
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
                  <h2 className="font-medium">Your Borrow Positions</h2>
                  <button
                    onClick={() => router.push("/borrow")}
                    className="flex items-center gap-2 text-sm hover:text-[var(--primary)] hover:underline py-1"
                  >
                    Borrow More
                    <ArrowRight className="w-4 h-4" />
                  </button>{" "}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[var(--card-bg-secondary)]">
                        <th className="text-left text-xs font-medium text-[var(--secondary)] px-4 py-3">
                          Asset
                        </th>
                        <th className="text-right text-xs font-medium text-[var(--secondary)] px-4 py-3">
                          Debt
                        </th>
                        <th className="text-right text-xs font-medium text-[var(--secondary)] px-4 py-3">
                          Value (USD)
                        </th>
                        <th className="text-right text-xs font-medium text-[var(--secondary)] px-4 py-3">
                          APY
                        </th>
                        <th className="text-right text-xs font-medium text-[var(--secondary)] px-4 py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {borrowAssets.map((position) => (
                        <tr
                          key={position.assetId}
                          className="border-b border-[var(--border-color)] last:border-0"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <AssetImage
                                logoUrl={position.asset?.logoUrl || ""}
                                symbol={position.asset?.symbol || ""}
                                size={8}
                              />
                              <div>
                                <div className="font-medium">
                                  {position.asset?.name}
                                </div>
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
                            <div>${position.amount.toLocaleString()}</div>
                            <div className="text-xs text-[var(--secondary)]">
                              {position.asset?.symbol}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div>${position.valueUSD.toLocaleString()}</div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="text-[var(--danger)]">
                              {position.apy.toFixed(1)}%
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedAsset({
                                    contractAddress:
                                      position.asset?.contractAddress || "",
                                    name: position.asset?.name || "",
                                    symbol: position.asset?.symbol || "",
                                  });
                                  setIsRepaySheetOpen(true);
                                }}
                                className="cursor-pointer px-4 py-1 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white"
                              >
                                Repay
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* Withdraw Sheet */}
      <Sheet open={isWithdrawSheetOpen} onOpenChange={setIsWithdrawSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {selectedAsset
                ? `Withdraw ${selectedAsset.name} (${selectedAsset.symbol})`
                : "Withdraw"}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <WithdrawForm assetAddress={selectedAsset?.contractAddress} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Repay Sheet */}
      <Sheet open={isRepaySheetOpen} onOpenChange={setIsRepaySheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {selectedAsset
                ? `Repay ${selectedAsset.name} (${selectedAsset.symbol})`
                : "Repay"}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <RepayForm
              assetAddress={selectedAsset?.contractAddress}
              outstandingDebt={
                borrowAssets.find(
                  (b) => b.assetId === selectedAsset?.symbol.toLowerCase()
                )?.valueUSD || 0
              }
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
