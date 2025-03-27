"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { Wallet, Loader2 } from "lucide-react";
import { LENDER_CONTRACT_ADDRESS, TUSDC_TOKEN_ADDRESS } from "@/config/contracts";
import lenderABI from "@/abi/Lender.json";
import htsABI from "@/abi/HederaTokenService.json";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { formatAddress } from "@/lib/wagmi";
import { Abi } from "viem";

interface SupplyFormProps {
  assetAddress?: string;
}

interface SupplyFormData {
  amount: string;
}

export default function SupplyForm({ 
  assetAddress,
}: SupplyFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm<SupplyFormData>({
    defaultValues: {
      amount: "",
    },
  });

  const [isKes, setIsKes] = useState(false);
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  // Get USDC balance for the connected wallet
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useBalance({
    address: address,
    token: TUSDC_TOKEN_ADDRESS as `0x${string}`,
  });

  // Format USDC balance with 6 decimals
  const formattedUsdcBalance = usdcBalance ? 
    (Number(usdcBalance.value) / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 
    "0.00";

  // Format USDC balance in KES
  const formattedUsdcBalanceInKes = usdcBalance ? 
    (Number(usdcBalance.value) / 1e6 * 129).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : 
    "0";
  
  const { writeContractAsync } = useWriteContract();
  const { data: supplyHash } = useWriteContract();
  
  const { isLoading: isWaiting } = useWaitForTransactionReceipt({
    hash: supplyHash,
  });

  const contractConfig = {
    address: formatAddress(LENDER_CONTRACT_ADDRESS),
    abi: lenderABI.abi as Abi,
    functionName: "provideLiquidity",
  } as const;

  // Set amount based on percentage of max allowable amount
  const handlePercentage = (percentage: number) => {
    const maxAmount = Number(formattedUsdcBalance.toString().replace(/,/g, ''));
    if (maxAmount > 0) {
      const calculatedAmount = (maxAmount * percentage / 100).toFixed(2);
      setValue("amount", calculatedAmount);
    } else {
      toast({
        title: "Insufficient Balance",
        description: "You don't have any USDC balance to supply.",
        variant: "destructive"
      });
    }
  };

  // Handle supply submission
  const onSubmit = async (data: SupplyFormData) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to supply USDC.",
        variant: "destructive"
      });
      return;
    }
    
    if (!data.amount || Number(data.amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid amount.",
        variant: "destructive"
      });
      return;
    }

    if (!assetAddress) {
      toast({
        title: "Invalid Asset",
        description: "Please select an asset to supply.",
        variant: "destructive"
      });
      return;
    }

    

    if (Number(data.amount) > Number(formattedUsdcBalance)) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${formattedUsdcBalance} USDC available to supply.`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Calculate the amount in USDC (6 decimals)
      const amountInUsdc = BigInt(Math.floor(Number(data.amount) * 1e6));
      
      // First approve USDC spending using HTS
      const approvalHash = await writeContractAsync({
        address: "0x0000000000000000000000000000000000000167" as `0x${string}`, // HTS Precompile address
        abi: htsABI.abi as Abi,
        functionName: "approve",
        args: [
          TUSDC_TOKEN_ADDRESS, // Token address
          LENDER_CONTRACT_ADDRESS, // Spender address (don't format this)
          amountInUsdc
        ],
      });

      toast({
        title: "Approval initiated",
        description: `Please wait for approval to complete before supplying...`,
      });

      // Wait for approval transaction to be mined
      await new Promise((resolve) => setTimeout(resolve, 5000));

      if (approvalHash) {
        // Then supply the USDC
        const hash = await writeContractAsync({
          ...contractConfig,
          args: [formatAddress(assetAddress), amountInUsdc], // Use unformatted addresses
        });

        toast({
          title: "Supply initiated",
          description: `Transaction hash: ${hash}`,
        });

        // Wait for supply transaction to be mined
        await new Promise((resolve) => setTimeout(resolve, 5000));

        setValue("amount", "");
        
        toast({
          title: "Supply successful",
          description: `You have successfully supplied ${data.amount} USDC.`,
        });
      }
      
    } catch (error) {
      console.error("Supply error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate supply. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      refetchUsdcBalance();
    }
  };

  const isSubmitting = isLoading || isWaiting;
  const buttonDisabled = !watch("amount") || isSubmitting || !isConnected || Number(watch("amount")) <= 0;

  return (
    <div className="card">
      <form onSubmit={handleSubmit(onSubmit)} className="p-4">
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <label htmlFor="supply-amount" className="text-sm mb-1 block">
                Amount
              </label>
            </div>
            <div className="flex flex-col md:flex-row flex-start items-center gap-2 py-1">
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
                    ? formattedUsdcBalanceInKes
                    : formattedUsdcBalance}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex rounded-md overflow-hidden border border-[var(--border-color)]">
            <div className="bg-[var(--border-color)]/20 flex items-center px-2">
              <span className="text-[var(--secondary)] text-sm">{isKes ? 'KES' : 'USDC'}</span>
            </div>
            <input
              id="supply-amount"
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
        
        <div className="mb-4 p-3 rounded-md bg-[var(--border-color)]/10">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[var(--secondary)]">Total</span>
            <span>{isKes ? 'KES' : 'USDC'} {watch("amount") ? (isKes ? (parseFloat(watch("amount")) * 129).toLocaleString('en-US', { maximumFractionDigits: 0 }) : parseFloat(watch("amount")).toLocaleString('en-US', { maximumFractionDigits: 2 })) : "0"}</span>
          </div>
        </div>
        
        <button
          type="submit"
          className={cn(
            "w-full py-3 rounded-md font-medium",
            "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]",
            buttonDisabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={buttonDisabled}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Wallet className="w-4 h-4" /> Supply USDC
            </span>
          )}
        </button>
        
        <div className="mt-4 text-xs text-[var(--secondary)]">
          <p>By supplying USDC, you agree to our Terms of Service and Privacy Policy. You will receive LP tokens in return for your supply.</p>
        </div>
      </form>
    </div>
  );
} 