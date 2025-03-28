"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Wallet, Loader2, Droplet } from "lucide-react";
import { TUSDC_TOKEN_ADDRESS } from "@/config/contracts";
import tempUsdcABI from "@/abi/TempUSDC.json";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { formatAddress } from "@/lib/wagmi";
import { Abi } from "viem";

interface FaucetFormData {
  amount: string;
}

export default function Faucet() {
  const { handleSubmit, setValue } = useForm<FaucetFormData>({
    defaultValues: {
      amount: "10000",
    },
  });

  const { isConnected } = useAccount();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const { data: requestHash } = useWriteContract();
  
  const { isLoading: isWaiting } = useWaitForTransactionReceipt({
    hash: requestHash,
  });

  const onSubmit = async (data: FaucetFormData) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to request tokens.",
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

    setIsLoading(true);
    
    try {
      // Convert amount to uint64 (matches the contract's expected type)
      const amountInTusdc = BigInt(Math.floor(Number(data.amount) * 1e6));
      
      await writeContractAsync({
        address: formatAddress(TUSDC_TOKEN_ADDRESS),
        abi: tempUsdcABI.abi as Abi,
        functionName: "requestAirdrop",
        args: [amountInTusdc],
      });

      toast({
        title: "Request initiated",
        description: "Waiting for tokens to be sent to your wallet...",
      });

      setValue("amount", "");
      
    } catch (error) {
      console.error("Faucet request error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to request tokens. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitting = isLoading || isWaiting;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Droplet className="w-6 h-6 text-[var(--primary)]" />
          <h1 className="text-2xl font-semibold">Token Faucet</h1>
        </div>
        
        <p className="text-[var(--secondary)] mb-6">
          Request KES test tokens to use in the Hedgehog Protocol. These tokens can be used for testing trading, lending, and other protocol features.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-2">
              Amount (KES)
            </label>
            <input
              type="number"
              id="amount"
              defaultValue="1000"
              className="w-full px-4 py-2 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Enter amount"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isConnected}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-sm font-medium transition-colors",
              isConnected
                ? "bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white"
                : "bg-[var(--border-color)] text-[var(--secondary)] cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : !isConnected ? (
              <>
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </>
            ) : (
              <>
                <Droplet className="w-4 h-4" />
                <span>Request Tokens</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}