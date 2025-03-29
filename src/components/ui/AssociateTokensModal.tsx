"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { Loader2 } from "lucide-react";
import htsABI from "@/abi/HederaTokenService.json";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { formatAddress } from "@/lib/wagmi";
import { Abi } from "viem";
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
      // Get all contract addresses from assets
      const contractAddresses = assets.map(asset => formatAddress(asset.contractAddress));


      // Associate all tokens at once
      const associateHash = await writeContractAsync({
        address: "0x0000000000000000000000000000000000000167" as `0x${string}`,
        abi: htsABI.abi as Abi,
        functionName: "associateTokens",
        args: [address, contractAddresses],
      });

      toast({
        title: "Token association in progress",
        description: "Waiting for token association to be confirmed...",
        className: "bg-yellow-500/50 border-yellow-500 text-white border-none",
      });

      await publicClient?.waitForTransactionReceipt({ hash: associateHash });

      // Mark tokens as associated in local storage
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
        description: error instanceof Error ? error.message : "Failed to associate tokens.",
        variant: "destructive",
      });
       // Mark tokens as associated in local storage
       localStorage.setItem(TOKENS_ASSOCIATED_KEY, "true");
    } finally {
      setIsLoading(false);
       // Mark tokens as associated in local storage
       localStorage.setItem(TOKENS_ASSOCIATED_KEY, "true");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Associate tokens to proceed</DialogTitle>
          <DialogDescription>
            Associate all available tokens with your wallet to enable trading.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-[var(--secondary)]">
              Click the button below to associate all available tokens with your wallet.
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
                <Loader2 className="w-4 h-4 animate-spin" /> Associating Tokens...
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