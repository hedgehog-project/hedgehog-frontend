"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { ArrowDown, Wallet, Loader2 } from "lucide-react";
import { ISSUER_CONTRACT_ADDRESS, TUSDC_TOKEN_ADDRESS } from "@/config/contracts";
import issuerABI from "@/abi/Issuer.json";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { formatAddress } from "@/lib/wagmi";
import { Abi } from "viem";
import htsABI from "@/abi/HederaTokenService.json";

interface BuyAssetFormProps {
  assetName?: string; // Full name of the stock (e.g., "Safaricom PLC")
  assetSymbol?: string; // Token symbol (e.g., "hhSAF")
  assetPrice?: number;
  tokenizedSymbol?: string;
}

interface BuyAssetFormData {
  amount: string;
  quantity: string;
}

export default function BuyAssetForm({ 
  assetName,
  assetPrice,
  tokenizedSymbol,
}: BuyAssetFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm<BuyAssetFormData>({
    defaultValues: {
      amount: "",
      quantity: "",
    },
  });

  const [isKes, setIsKes] = useState(false);
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  // Get TUSDC balance for the connected wallet
  const { data: tusdcBalance, refetch: refetchTusdcBalance } = useBalance({
    address: address,
    token: TUSDC_TOKEN_ADDRESS as `0x${string}`,
  });

  // Format TUSDC balance with 6 decimals
  const formattedTusdcBalance = tusdcBalance ? 
    (Number(tusdcBalance.value) / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 
    "0.00";
  
  const { writeContractAsync } = useWriteContract();
  const { data: buyHash } = useWriteContract();
  
  const { isLoading: isWaiting } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  const contractConfig = {
    address: formatAddress(ISSUER_CONTRACT_ADDRESS),
    abi: issuerABI.abi as Abi,
    functionName: "purchaseAsset",
  } as const;

  // Set amount based on percentage of max allowable amount
  const handlePercentage = (percentage: number) => {
    const maxAmount = Number(formattedTusdcBalance.toString().replace(/,/g, ''));
    if (maxAmount > 0) {
      const calculatedAmount = (maxAmount * percentage / 100).toFixed(0);
      setValue("amount", calculatedAmount);
    } else {
      toast({
        title: "Insufficient Balance",
        description: "You don't have any TUSDC balance to trade with.",
        variant: "destructive"
      });
    }
  };

  // Handle buy submission
  const onSubmit = async (data: BuyAssetFormData) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to buy tokens.",
        variant: "destructive"
      });
      return;
    }
    
    if (!data.amount || !data.quantity || Number(data.quantity) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid amount and quantity.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Calculate the amount in TUSDC (6 decimals)
      const amountInTusdc = BigInt(Math.floor(Number(data.amount) * 1e6));
      
      // First approve TUSDC spending using HTS
      const approvalHash = await writeContractAsync({
        address: "0x0000000000000000000000000000000000000167" as `0x${string}`, // HTS Precompile address
        abi: htsABI.abi as Abi,
        functionName: "approve",
        args: [
          TUSDC_TOKEN_ADDRESS,
          formatAddress(ISSUER_CONTRACT_ADDRESS),
          amountInTusdc
        ],
      });

      toast({
        title: "Approval initiated",
        description: `Please wait for approval to complete before purchase...`,
      });

      if (approvalHash) {
        // Then make the purchase using the quantity instead of amount
        const hash = await writeContractAsync({
          ...contractConfig,
          args: [assetName, BigInt(Number(data.quantity))], // Use quantity for the asset purchase
        });
        toast({
          title: "Purchase initiated",
          description: `Transaction hash: ${hash}`,
        });
      }

      setValue("amount", "");
      setValue("quantity", "");
      
    } catch (error) {
      console.error("Buy error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      refetchTusdcBalance();
      toast({
        title: "Purchase successful",
        description: `You have successfully purchased ${data.quantity} ${assetName} shares.`,
      });
    }
  };

  const isSubmitting = isLoading || isWaiting;
  const buttonDisabled = !watch("amount") || !watch("quantity") || isSubmitting || !isConnected || Number(watch("quantity")) <= 0;

  return (
    <div className="card">
      <form onSubmit={handleSubmit(onSubmit)} className="p-4">
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <label htmlFor="buy-amount" className="text-sm mb-1 block">
                Amount
              </label>
            </div>
            <div className="flex items-center gap-2 py-1">
              <div className="flex items-center gap-1">
                <span className="text-[var(--secondary)] text-xs">Currency:</span>
                <button
                  type="button"
                  onClick={() => setIsKes(!isKes)}
                  className="font-semibold text-xs px-2 py-1 rounded-md border border-[var(--border-color)] hover:bg-[var(--border-color)]/20 transition-colors"
                >
                  {isKes ? 'KES' : 'USDC'}
                </button>
              </div>
              <div className="flex items-end">
                <span className="text-[var(--secondary)] text-xs pr-1">Balance: </span>
                <span className="text-xs font-semibold">
                  {isKes 
                    ? (Number(formattedTusdcBalance.replace(/,/g, '')) * 129).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                    : formattedTusdcBalance}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex rounded-md overflow-hidden border border-[var(--border-color)]">
            <div className="bg-[var(--border-color)]/20 flex items-center px-2 ">
              <span className="text-[var(--secondary)] text-sm">{isKes ? 'KES' : 'USDC'}</span>
            </div>
            <input
              id="buy-amount"
              type="text"
              {...register("amount")}
              className="flex-1 bg-transparent outline-none py-2 px-3 w-full"
              placeholder="0"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex justify-between text-sm mb-1">
            <div className="flex gap-2 mt-2">
              {[25, 50, 75, 100].map((percent) => (
                <button
                  key={percent}
                  type="button"
                  onClick={() => handlePercentage(percent)}
                  className="text-xs px-2 py-1 rounded-md border border-[var(--border-color)] hover:bg-[var(--border-color)]/20 transition-colors"
                  disabled={isSubmitting}
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="relative flex items-center justify-center my-4">
          <div className="absolute border-t border-[var(--border-color)] w-full"></div>
          <div className="bg-[var(--card-bg)] relative px-2 z-10">
            <ArrowDown className="w-5 h-5 text-[var(--secondary)]" />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="buy-quantity" className="text-sm mb-1 block">
            You&apos;ll Receive ({assetName})
          </label>
          <div className="flex rounded-md overflow-hidden border border-[var(--border-color)]">
            <div className="bg-[var(--border-color)]/20 flex items-center px-2">
              <span className="text-[var(--secondary)] text-sm">{assetName}</span>
            </div>
            <input
              id="buy-quantity"
              type="text"
              {...register("quantity")}
              className="flex-1 bg-transparent outline-none py-2 px-3 w-full"
              placeholder="0"
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div className="mb-4 p-3 rounded-md bg-[var(--border-color)]/10">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[var(--secondary)]">Price</span>
            <span>{isKes ? 'KES' : 'USDC'} {assetPrice ? (isKes ? (assetPrice * 129).toLocaleString('en-US', { maximumFractionDigits: 2 }) : assetPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })) : "0.00"}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[var(--secondary)]">Total</span>
            <span>{isKes ? 'KES' : 'USDC'} {watch("amount") ? (isKes ? parseFloat(watch("amount")).toLocaleString('en-US', { maximumFractionDigits: 0 }) : parseFloat(watch("amount")).toLocaleString('en-US', { maximumFractionDigits: 0 })) : "0"}</span>
          </div>
        </div>
        
        <button
          type="submit"
          className={cn(
            "w-full py-3 rounded-md font-medium",
            "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]",
            buttonDisabled && "opacity-70 cursor-not-allowed"
          )}
          disabled={buttonDisabled}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Wallet className="w-4 h-4" /> Buy {tokenizedSymbol}
            </span>
          )}
        </button>
        
        <div className="mt-4 text-xs text-[var(--secondary)]">
          <p>By submitting this order, you agree to our Terms of Service and Privacy Policy. Market conditions may affect final settlement price.</p>
        </div>
      </form>
    </div>
  );
} 