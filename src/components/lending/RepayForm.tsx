"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { Wallet, Loader2 } from "lucide-react";
import { LENDER_CONTRACT_ADDRESS, TUSDC_TOKEN_ADDRESS} from "@/config/contracts";
import lenderABI from "@/abi/Lender.json";
import htsABI from "@/abi/HederaTokenService.json";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { formatAddress } from "@/lib/wagmi";
import { Abi } from "viem";

interface RepayFormProps {
  assetAddress?: string;
  outstandingDebt?: number;
}

interface RepayFormData {
  amount: string;
}

export default function RepayForm({ 
  assetAddress,
  outstandingDebt = 0,
}: RepayFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm<RepayFormData>({
    defaultValues: {
      amount: "",
    },
  });

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
  
  const { writeContractAsync } = useWriteContract();
  const { data: repayHash } = useWriteContract();
  
  const { isLoading: isWaiting } = useWaitForTransactionReceipt({
    hash: repayHash,
  });

  const contractConfig = {
    address: formatAddress(LENDER_CONTRACT_ADDRESS),
    abi: lenderABI.abi as Abi,
    functionName: "repayOutstandingLoan",
  } as const;

  // Set amount based on percentage of outstanding debt
  const handlePercentage = (percentage: number) => {
    if (outstandingDebt > 0) {
      const calculatedAmount = (outstandingDebt * percentage / 100).toFixed(2);
      setValue("amount", calculatedAmount);
    } else {
      toast({
        title: "No Outstanding Debt",
        description: "You don't have any debt to repay.",
        variant: "destructive"
      });
    }
  };

  // Handle repay submission
  const onSubmit = async (data: RepayFormData) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to repay.",
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

    if (Number(data.amount) > outstandingDebt) {
      toast({
        title: "Exceeds Outstanding Debt",
        description: `You only have ${outstandingDebt.toLocaleString()} USDC of debt to repay.`,
        variant: "destructive"
      });
      return;
    }

    if (!assetAddress) {
      toast({
        title: "Invalid Asset",
        description: "Please select an asset to repay.",
        variant: "destructive"
      });
      return;
    }

    const amountNumber = Number(data.amount);
    if (amountNumber > Number(formattedUsdcBalance)) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${formattedUsdcBalance} USDC available.`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Calculate the amount in USDC (6 decimals)
      const amountInUsdc = BigInt(Math.floor(amountNumber * 1e6));
      
      // First approve USDC spending using HTS
      const approvalHash = await writeContractAsync({
        address: "0x0000000000000000000000000000000000000167" as `0x${string}`, // HTS Precompile address
        abi: htsABI.abi as Abi,
        functionName: "approve",
        args: [
          TUSDC_TOKEN_ADDRESS, // USDC Token address
          LENDER_CONTRACT_ADDRESS, // Spender address
          amountInUsdc
        ],
      });

      toast({
        title: "Approval initiated",
        description: `Please wait for approval to complete before repaying...`,
      });

      // Wait for approval transaction to be mined
      await new Promise((resolve) => setTimeout(resolve, 5000));

      if (approvalHash) {
        // Then repay the loan
        const hash = await writeContractAsync({
          ...contractConfig,
          args: [formatAddress(assetAddress)],
        });

        toast({
          title: "Repayment initiated",
          description: `Transaction hash: ${hash}`,
        });

        // Wait for repay transaction to be mined
        await new Promise((resolve) => setTimeout(resolve, 5000));

        setValue("amount", "");
        
        toast({
          title: "Repayment successful",
          description: `You have successfully repaid ${data.amount} USDC.`,
        });
      }
      
    } catch (error) {
      console.error("Repay error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate repayment. Please try again.",
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
            <label htmlFor="repay-amount" className="text-sm mb-1 block">
              Amount (USDC)
            </label>
            <div className="flex items-end gap-4">
              <div>
                <span className="text-[var(--secondary)] text-xs pr-1"> Debt: </span>
                <span className="text-xs">${outstandingDebt.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[var(--secondary)] text-xs pr-1">Balance: </span>
                <span className="text-xs">${formattedUsdcBalance}</span>
              </div>
            </div>
          </div>
          
          <div className="flex rounded-md overflow-hidden border border-[var(--border-color)]">
            <div className="bg-[var(--border-color)]/20 flex items-center px-2">
              <span className="text-[var(--secondary)] text-sm">USDC</span>
            </div>
            <input
              id="repay-amount"
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
            <span>USDC {watch("amount") ? parseFloat(watch("amount")).toLocaleString('en-US', { maximumFractionDigits: 2 }) : "0.00"}</span>
          </div>
        </div>
        
        <button
          type="submit"
          className={cn(
            "w-full py-3 rounded-md font-medium",
            "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90",
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
              <Wallet className="w-4 h-4" /> Repay USDC
            </span>
          )}
        </button>
        
        <div className="mt-4 text-xs text-[var(--secondary)]">
          <p>By repaying your loan, you&apos;ll reduce your debt and improve your health factor. This will help protect your collateral from liquidation.</p>
        </div>
      </form>
    </div>
  );
} 