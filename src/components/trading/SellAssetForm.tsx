"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { ArrowDown, DollarSign, Loader2 } from "lucide-react";
import { ISSUER_CONTRACT_ADDRESS, SAFARICOM_TOKEN_ADDRESS } from "@/config/contracts";
import issuerABI from "@/abi/Issuer.json";
import htsABI from "@/abi/HederaTokenService.json";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { formatAddress } from "@/lib/wagmi";
import { Abi } from "viem";

interface SellAssetFormProps {
  assetName?: string;
  assetPrice?: number;
}

export default function SellAssetForm({ 
  assetName = "Safaricom",
  assetPrice,
}: SellAssetFormProps) {
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("");
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  // Get hhSAF balance for the connected wallet
  const { data: hhSafBalance, refetch: refetchSafBalance } = useBalance({
    address: address,
    token: SAFARICOM_TOKEN_ADDRESS as `0x${string}`,
  });

  // Format hhSAF balance
  const formattedHhSafBalance = hhSafBalance ? 
    Number(hhSafBalance.value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : 
    "0";
  
  const { writeContractAsync } = useWriteContract();
  const { data: sellHash } = useWriteContract();
  
  const { isLoading: isWaiting } = useWaitForTransactionReceipt({
    hash: sellHash,
  });

  const contractConfig = {
    address: formatAddress(ISSUER_CONTRACT_ADDRESS),
    abi: issuerABI.abi as Abi,
    functionName: "sellAsset",
  } as const;

  // Calculate quantity based on amount
  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (value && !isNaN(parseFloat(value)) && assetPrice) {
      const calculatedQuantity = (parseFloat(value) / assetPrice).toFixed(0);
      setQuantity(calculatedQuantity);
    } else {
      setQuantity("");
    }
  };
  
  // Calculate amount based on quantity
  const handleQuantityChange = (value: string) => {
    setQuantity(value);
    if (value && !isNaN(parseFloat(value)) && assetPrice) {
      const calculatedAmount = (parseFloat(value) * assetPrice).toFixed(0);
      setAmount(calculatedAmount);
    } else {
      setAmount("");
    }
  };
  
  // Set quantity based on percentage of max allowable amount
  const handlePercentage = (percentage: number) => {
    const maxQuantity = Number(formattedHhSafBalance.toString().replace(/,/g, ''));
    if (maxQuantity > 0) {
      const calculatedQuantity = (maxQuantity * percentage / 100).toFixed(0);
      handleQuantityChange(calculatedQuantity);
    } else {
      toast({
        title: "Insufficient Balance",
        description: "You don't have any hhSAF tokens to sell.",
        variant: "destructive"
      });
    }
  };

  // Handle sell submission
  const handleSell = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to sell tokens.",
        variant: "destructive"
      });
      return;
    }
    
    if (!amount || !quantity || Number(quantity) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid amount and quantity.",
        variant: "destructive"
      });
      return;
    }

    if (Number(quantity) > Number(formattedHhSafBalance)) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${formattedHhSafBalance} hhSAF tokens available to sell.`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // First approve the contract to spend hhSAF tokens
      const approvalHash = await writeContractAsync({
        address: "0x0000000000000000000000000000000000000167" as `0x${string}`, // HTS Precompile address
        abi: htsABI.abi as Abi,
        functionName: "approve",
        args: [
          SAFARICOM_TOKEN_ADDRESS,
          formatAddress(ISSUER_CONTRACT_ADDRESS),
          BigInt(Number(quantity))
        ],
      });

      toast({
        title: "Approval initiated",
        description: `Please wait for approval to complete before sale...`,
      });

      if (approvalHash) {
        // Then make the sale using the quantity
        const hash = await writeContractAsync({
          ...contractConfig,
          args: [assetName, BigInt(Number(quantity))],
        });

        toast({
          title: "Sale initiated",
          description: `Transaction hash: ${hash}`,
        });

        setAmount("");
        setQuantity("");
      }
      
    } catch (error) {
      console.error("Sell error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate sale. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      refetchSafBalance();
      toast({
        title: "Sale successful",
        description: `You have successfully sold ${quantity} ${assetName} shares.`,
      });
    }
  };

  const isSubmitting = isLoading || isWaiting;
  const buttonDisabled = !amount || !quantity || isSubmitting || !isConnected || Number(quantity) <= 0;

  return (
    <div className="card">
      <div className="p-4">
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <label htmlFor="sell-quantity" className="text-sm mb-1 block">
              Quantity (hhSAF)
            </label>
            <div className="flex items-end">
              <span className="text-[var(--secondary)] text-xs pr-1">Balance: </span>
              <span className="text-xs">{formattedHhSafBalance}</span>
            </div>
          </div>
          
          <div className="flex rounded-md overflow-hidden border border-[var(--border-color)]">
            <div className="bg-[var(--border-color)]/20 flex items-center px-2">
              <span className="text-[var(--secondary)] text-sm">hhSAF</span>
            </div>
            <input
              id="sell-quantity"
              type="text"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
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
          <label htmlFor="sell-amount" className="text-sm mb-1 block">
            You&apos;ll Receive (TUSDC)
          </label>
          <div className="flex rounded-md overflow-hidden border border-[var(--border-color)]">
            <div className="bg-[var(--border-color)]/20 flex items-center px-2">
              <span className="text-[var(--secondary)] text-sm">TUSDC</span>
            </div>
            <input
              id="sell-amount"
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="flex-1 bg-transparent outline-none py-2 px-3 w-full"
              placeholder="0"
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div className="mb-4 p-3 rounded-md bg-[var(--border-color)]/10">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[var(--secondary)]">Price</span>
            <span>TUSDC {assetPrice?.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[var(--secondary)]">Total</span>
            <span>TUSDC {amount ? parseFloat(amount).toLocaleString('en-US', { maximumFractionDigits: 0 }) : "0"}</span>
          </div>
        </div>
        
        <button
          className={cn(
            "w-full py-3 rounded-md font-medium",
            "bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90",
            buttonDisabled && "opacity-70 cursor-not-allowed"
          )}
          onClick={handleSell}
          disabled={buttonDisabled}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <DollarSign className="w-4 h-4" /> Sell {assetName}
            </span>
          )}
        </button>
        
        <div className="mt-4 text-xs text-[var(--secondary)]">
          <p>By submitting this order, you agree to our Terms of Service and Privacy Policy. Market conditions may affect final settlement price.</p>
        </div>
      </div>
    </div>
  );
} 