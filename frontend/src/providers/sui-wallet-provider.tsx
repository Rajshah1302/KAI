'use client';

/**
 * Sui Wallet Provider
 * Wraps the application with Sui wallet context using @mysten/dapp-kit
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { ReactNode, useMemo } from 'react';
import { CURRENT_NETWORK_CONFIG, DEFAULT_NETWORK } from '@/lib/sui/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface SuiWalletProviderProps {
  children: ReactNode;
}

export function SuiWalletProvider({ children }: SuiWalletProviderProps) {
  const networks = useMemo(
    () => ({
      [DEFAULT_NETWORK]: {
        url: CURRENT_NETWORK_CONFIG.fullnodeUrl,
      },
      // Add other networks if needed
      ...(DEFAULT_NETWORK !== 'mainnet' && {
        mainnet: {
          url: getFullnodeUrl('mainnet'),
        },
      }),
      ...(DEFAULT_NETWORK !== 'testnet' && {
        testnet: {
          url: getFullnodeUrl('testnet'),
        },
      }),
      ...(DEFAULT_NETWORK !== 'devnet' && {
        devnet: {
          url: getFullnodeUrl('devnet'),
        },
      }),
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

