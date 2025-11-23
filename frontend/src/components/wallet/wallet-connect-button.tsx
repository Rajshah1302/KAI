'use client';

import { ConnectButton, useWallet } from '@suiet/wallet-kit';
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

export function WalletConnectButton() {
  const { connected, address } = useWallet();

  if (connected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Wallet className="h-4 w-4" />
            {address.slice(0, 6)}...{address.slice(-4)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            <div className="font-medium">Address</div>
            <div className="font-mono text-xs break-all">{address}</div>
          </div>
          <DropdownMenuSeparator />
          <div className="p-2">
            <ConnectButton />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return <ConnectButton />;
}

