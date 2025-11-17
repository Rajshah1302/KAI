'use client';

/**
 * Sui Wallet Hooks
 * Custom hooks for wallet connection and interaction
 */

import { useCurrentWallet, useWallets } from '@mysten/dapp-kit';
import { useSuiClient } from '@mysten/dapp-kit';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { normalizeSuiAddress } from '@mysten/sui.js/utils';
import { resolveSuiNSAddress, resolveSuiNSName } from '@/lib/sui/suins';
import { formatAddress } from '@/lib/sui/config';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  displayName: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to get current wallet state with SuiNS resolution
 */
export function useSuiWallet() {
  const currentWallet = useCurrentWallet();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isLoadingName, setIsLoadingName] = useState(false);

  const address = currentWallet?.accounts[0]?.address
    ? normalizeSuiAddress(currentWallet.accounts[0].address)
    : null;

  // Resolve SuiNS name when address changes
  useEffect(() => {
    if (address) {
      setIsLoadingName(true);
      resolveSuiNSAddress(address)
        .then((name) => {
          setDisplayName(name);
        })
        .catch((error) => {
          console.error('Failed to resolve SuiNS name:', error);
          setDisplayName(null);
        })
        .finally(() => {
          setIsLoadingName(false);
        });
    } else {
      setDisplayName(null);
      setIsLoadingName(false);
    }
  }, [address]);

  return {
    isConnected: currentWallet?.isConnected ?? false,
    address,
    displayName,
    isLoading: isLoadingName || (currentWallet?.isConnecting ?? false),
    wallet: currentWallet,
    currentAccount: currentWallet?.accounts[0] ?? null,
  };
}

/**
 * Hook to get available wallets
 */
export function useAvailableWallets() {
  const wallets = useWallets();
  return {
    configuredWallets: wallets.filter((w: any) => w.installed),
    availableWallets: wallets.filter((w: any) => !w.installed),
    allWallets: wallets,
  };
}

/**
 * Hook to resolve an address to SuiNS name
 */
export function useSuiNSName(address: string | null | undefined) {
  const [name, setName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setName(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    resolveSuiNSAddress(address)
      .then((resolvedName) => {
        setName(resolvedName);
      })
      .catch((error) => {
        console.error('Failed to resolve SuiNS name:', error);
        setName(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [address]);

  return { name, isLoading };
}

/**
 * Hook to format an address with SuiNS fallback
 */
export function useFormattedAddress(address: string | null | undefined) {
  const { name, isLoading } = useSuiNSName(address);

  const formatted = useMemo(() => {
    if (!address) return '';
    if (name) return name;
    return formatAddress(address);
  }, [address, name]);

  return { formatted, name, isLoading };
}

/**
 * Helper to format address display with SuiNS
 */
export function formatAddressDisplay(
  address: string | null | undefined,
  name: string | null | undefined
): string {
  if (!address) return '';
  if (name) return name;
  return formatAddress(address);
}

