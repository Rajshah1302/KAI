'use client';

import { WalletProvider } from '@suiet/wallet-kit';
import { SuiClientProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import '@suiet/wallet-kit/style.css';
import { DEFAULT_NETWORK, CURRENT_NETWORK_CONFIG } from '@/lib/sui/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export function SuiWalletProvider({ children }: { children: React.ReactNode }) {
  const networks = {
    [DEFAULT_NETWORK]: {
      url: CURRENT_NETWORK_CONFIG.fullnodeUrl,
    },
    mainnet: {
      url: getFullnodeUrl('mainnet'),
    },
    testnet: {
      url: getFullnodeUrl('testnet'),
    },
    devnet: {
      url: getFullnodeUrl('devnet'),
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork={DEFAULT_NETWORK}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}