'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { useMemo } from 'react';
import { DEFAULT_NETWORK, CURRENT_NETWORK_CONFIG } from '@/lib/sui/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export function SuiWalletProvider({ children }: { children: React.ReactNode }) {
  const networks = useMemo(
    () => ({
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
    }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork={DEFAULT_NETWORK}>
        <WalletProvider
          autoConnect
          preferredWallets={['Suiet', 'Ethos Wallet', 'Sui Wallet']}
        >
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}