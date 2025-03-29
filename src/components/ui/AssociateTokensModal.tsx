"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { Loader2 } from "lucide-react";
import htsABI from "@/abi/HederaTokenService.json";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { formatAddress } from "@/lib/wagmi";
import { Abi, encodeFunctionData } from "viem";
import { assets } from "@/data/marketData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TOKENS_ASSOCIATED_KEY = "tokens_associated";

export const AssociateTokensModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { toast } = useToast();

  // Clear local storage when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      localStorage.removeItem(TOKENS_ASSOCIATED_KEY);
    }
  }, [isConnected]);

  // Check local storage and wallet connection status
  useEffect(() => {
    if (isConnected && !isOpen) {
      const tokensAssociated = localStorage.getItem(TOKENS_ASSOCIATED_KEY);
      if (!tokensAssociated) {
        setIsOpen(true);
      }
    }
  }, [isConnected, isOpen]);

  const handleAssociateTokens = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to associate tokens.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
    // Prepare contract addresses from assets
    const contractAddresses = assets.map(asset => formatAddress(asset.contractAddress)) as `0x${string}`[];
    console.log("Contract addresses:", contractAddresses);

    // Encode the function call data for associateTokens
    const data = encodeFunctionData({
      abi: htsABI.abi,
      functionName: "associateTokens",
      args: [address, contractAddresses],
    });

    // Define the contract address
    const contractAddress = "0x0000000000000000000000000000000000000167" as `0x${string}`;

    // Estimate gas with a try-catch for fallback
    let gasLimit;
    try {
      const gasEstimate = await publicClient?.estimateGas({
        account: address, // User's address for accurate estimation
        to: contractAddress,
        data: data,
      });
      // Add a 10% buffer to the gas estimate
      gasLimit = BigInt(Math.ceil(Number(gasEstimate) * 10.5));
      console.log("Estimated gas with buffer:", gasLimit);
    } catch (estimationError) {
      console.error("Gas estimation failed:", estimationError);
      toast({
        title: "Gas estimation failed",
        description: "Using default gas limit for the transaction.",
        variant: "destructive",
      });
      // Fallback to a default gas limit
      gasLimit = BigInt(10000000); // Adjust this value as needed
    }

    // Execute the transaction with the calculated gas limit
    const associateHash = await writeContractAsync({
      address: contractAddress,
      abi: htsABI.abi as Abi,
      functionName: "associateTokens",
      args: [address, contractAddresses],
      gas: gasLimit,
    });

    // Notify user that the transaction is in progress
    toast({
      title: "Token association in progress",
      description: "Waiting for token association to be confirmed...",
      className: "bg-yellow-500/50 border-yellow-500 text-white border-none",
    });

    // Wait for transaction confirmation
    await publicClient?.waitForTransactionReceipt({ hash: associateHash });

    // Update local storage and notify success
    localStorage.setItem(TOKENS_ASSOCIATED_KEY, "true");
    toast({
      title: "Token association successful",
      description: "All tokens have been associated with your account.",
      className: "bg-green-500/50 border-green-500 text-white border-none",
    });

    setIsOpen(false);
    } catch (error) {
      console.error("Token association error:", error);
      toast({
        title: "Token association failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to associate tokens.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Associate Tokens</DialogTitle>
          <DialogDescription>
            Associate all available tokens with your wallet to enable trading.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-[var(--secondary)]">
              Click the button below to associate all available tokens with your
              wallet.
            </p>
          </div>
          <button
            onClick={handleAssociateTokens}
            disabled={isLoading || !isConnected}
            className={cn(
              "w-full py-3 rounded-md font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]",
              (isLoading || !isConnected) && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Associating
                Tokens...
              </span>
            ) : (
              "Associate All Tokens"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
