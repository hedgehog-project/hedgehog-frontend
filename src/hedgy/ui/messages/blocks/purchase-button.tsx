"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useBalance, usePublicClient } from "wagmi";
import { Loader2 } from "lucide-react";
import { ISSUER_CONTRACT_ADDRESS, KES_TOKEN_ADDRESS } from "@/config/contracts";
import issuerABI from "@/abi/Issuer.json";
import { useToast } from "@/components/ui/use-toast";
import { formatAddress } from "@/lib/wagmi";
import { Abi, encodeFunctionData } from "viem";
import { adminClient } from "@/lib/admin";

interface Props {
  assetName: string;
  quantity: number;
}

export function PurchaseButton(props: Props) {
  const { assetName, quantity } = props;
  const { isConnected, address } = useAccount();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // Get KES balance for refetching after purchase
  const { refetch: refetchKesBalance } = useBalance({
    address,
    token: KES_TOKEN_ADDRESS as `0x${string}`,
  });

  const contractConfig = {
    address: formatAddress(ISSUER_CONTRACT_ADDRESS),
    abi: issuerABI.abi as Abi,
    functionName: "purchaseAsset",
  } as const;

  const handlePurchase = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to buy tokens.",
        className: "bg-red-500 text-white border-none",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Grant KYC to the user using admin client
      if (!publicClient) {
        toast({
          title: "Error",
          description: "Failed to initialize public client.",
          className: "bg-red-500 text-white border-none",
        });
        return;
      }

      try {
        const data = encodeFunctionData({
          abi: issuerABI.abi,
          functionName: 'grantKYC',
          args: [assetName, address],
        });

        const tx = {
          to: formatAddress(ISSUER_CONTRACT_ADDRESS),
          data,
        };
      
        const grantKycHash = await adminClient.sendTransaction(tx);

        toast({
          title: "KYC Grant in progress",
          description: "Waiting for KYC grant to be confirmed...",
          className: "bg-yellow-500/50 border-yellow-500 text-white border-none",
        });

        await publicClient?.waitForTransactionReceipt({ hash: grantKycHash });

        toast({
          title: "KYC Grant successful",
          description: "KYC has been granted to your account.",
          className: "bg-green-500/50 border-green-500 text-white border-none",
        });
      } catch (error) {
        console.error('KYC Grant error:', error);
        toast({
          title: "KYC Grant Failed",
          description: error instanceof Error ? error.message : "Failed to grant KYC. Please try again.",
          className: "bg-red-500 text-white border-none",
        });
        return;
      }

      // Purchase transaction
      const purchaseHash = await writeContractAsync({
        ...contractConfig,
        args: [assetName, BigInt(quantity)],
      });

      toast({
        title: "Purchase in progress",
        description: "Waiting for purchase transaction to be confirmed...",
        className: "bg-yellow-500/50 border-yellow-500 text-white border-none",
      });

      await publicClient?.waitForTransactionReceipt({ hash: purchaseHash });

      toast({
        title: "Purchase successful",
        description: `You have successfully purchased ${quantity} ${assetName} shares.`,
        className: "bg-green-500/50 border-green-500 text-white border-none",
      });

      refetchKesBalance();
    } catch (error) {
      console.error("Transaction error:", error);
      toast({
        title: "Transaction failed",
        description: error instanceof Error ? error.message : "Failed to complete the transaction.",
        className: "bg-red-500 text-white border-none",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mt-2">
      <button 
        onClick={handlePurchase}
        disabled={isLoading || !isConnected}
        className="w-[88%] mx-auto px-4 py-2 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <span>
            Buy {quantity} {assetName}
          </span>
        )}
      </button>
    </div>
  );
}
