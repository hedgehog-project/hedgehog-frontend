import { HEDERA_TESTNET_CHAIN_ID, HEDERA_MAINNET_CHAIN_ID } from "./constants";

// Default to testnet for development
const DEFAULT_NETWORK = process.env.NEXT_PUBLIC_DEFAULT_NETWORK || "testnet";
const IS_MAINNET = DEFAULT_NETWORK === "mainnet";

// Contract addresses based on network
const TESTNET_ADDRESSES = {
  ISSUER_CONTRACT: "0x000000000000000000000000000000000058005c", // Replace with actual testnet address
  LENDER_CONTRACT: "0x000000000000000000000000000000000058005f", // Replace with actual testnet address
  TUSDC_TOKEN: "0x0000000000000000000000000000000000580043", // Replace with actual testnet address
  SAFARICOM_TOKEN: "0x0000000000000000000000000000000000580066", // Replace with actual testnet address
};

const MAINNET_ADDRESSES = {
  ISSUER_CONTRACT: "0x9876543210987654321098765432109876543210", // Replace with actual mainnet address when deployed
  LENDER_CONTRACT: "0x1234567890abcdef1234567890abcdef12345678", // Replace with actual mainnet address when deployed
  TUSDC_TOKEN: "0xabcdef1234567890abcdef1234567890abcdef12", // Replace with actual mainnet address when deployed
  SAFARICOM_TOKEN: "0xfedcba0987654321fedcba0987654321fedcba09", // Replace with actual mainnet address when deployed
};

// Export contract addresses based on environment
export const ADDRESSES = IS_MAINNET ? MAINNET_ADDRESSES : TESTNET_ADDRESSES;

// Export individual contract addresses
export const ISSUER_CONTRACT_ADDRESS = ADDRESSES.ISSUER_CONTRACT;
export const LENDER_CONTRACT_ADDRESS = ADDRESSES.LENDER_CONTRACT;
export const TUSDC_TOKEN_ADDRESS = ADDRESSES.TUSDC_TOKEN;
export const SAFARICOM_TOKEN_ADDRESS = ADDRESSES.SAFARICOM_TOKEN;

// Export chain IDs
export const CURRENT_CHAIN_ID = IS_MAINNET 
  ? HEDERA_MAINNET_CHAIN_ID 
  : HEDERA_TESTNET_CHAIN_ID;

// Export RPC URLs
export const HEDERA_RPC_URL = IS_MAINNET
  ? process.env.NEXT_PUBLIC_HEDERA_MAINNET_RPC_URL || "https://mainnet.hashio.io/api"
  : process.env.NEXT_PUBLIC_HEDERA_TESTNET_RPC_URL || "https://testnet.hashio.io/api";

// Helper function to check if a network is supported
export function isSupportedNetwork(chainId: number | undefined): boolean {
  if (!chainId) return false;
  return chainId === HEDERA_TESTNET_CHAIN_ID || chainId === HEDERA_MAINNET_CHAIN_ID;
} 