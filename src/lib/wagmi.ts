import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
 hederaTestnet
} from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;    

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set');
}

export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId,
  chains: [
  hederaTestnet,
  ],
  ssr: true,
});
