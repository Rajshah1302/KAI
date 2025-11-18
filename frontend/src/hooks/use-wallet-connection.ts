'use client';

/**
 * Wallet Connection Hook
 * Provides programmatic wallet connection utilities
 */

import { useConnectWallet, useCurrentWallet } from '@mysten/dapp-kit';
import { useCallback } from 'react';

export function useWalletConnection() {
  const { mutate: connect, isPending, error } = useConnectWallet();
  const { currentWallet, connectionStatus } = useCurrentWallet();

  const connectWallet = useCallback(
    (walletName?: string) => {
      if (walletName) {
        connect({ wallet: walletName });
      } else {
        connect({});
      }
    },
    [connect]
  );

  return {
    connectWallet,
    isConnecting: isPending,
    connectionStatus,
    currentWallet,
    error,
  };
}

