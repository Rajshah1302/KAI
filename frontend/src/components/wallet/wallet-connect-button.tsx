'use client';

/**
 * Wallet Connect Button Component
 * Displays wallet connection UI with Sui wallet options
 */

import { ConnectButton, useCurrentWallet } from '@mysten/dapp-kit';
import { useSuiWallet } from '@/hooks/use-sui-wallet';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatAddressDisplay } from '@/hooks/use-sui-wallet';

export function WalletConnectButton() {
  const { isConnected, address, displayName } = useSuiWallet();

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Wallet className="h-4 w-4" />
            {displayName || formatAddressDisplay(address, displayName)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            <div className="font-medium">Address</div>
            <div className="font-mono text-xs break-all">{address}</div>
            {displayName && (
              <>
                <div className="font-medium mt-2">SuiNS Name</div>
                <div className="text-xs">{displayName}</div>
              </>
            )}
          </div>
          <DropdownMenuSeparator />
          <div className="p-2">
            <ConnectButton
              connectText="Switch Wallet"
              className="w-full"
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <ConnectButton
      connectText={
        <span className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </span>
      }
    />
  );
}

