'use client';

import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, CheckCircle2 } from 'lucide-react';
import { ConnectButton, useWallet } from '@suiet/wallet-kit';

export default function WalletConnectPage() {
  const { connected, address } = useWallet();

  if (connected && address) {
    return (
      <AppShell>
        <div className="flex justify-center items-center h-full">
          <Card className="w-full max-w-md bg-card/60 backdrop-blur-sm border-border/50 rounded-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle>Wallet Connected</CardTitle>
              <CardDescription>
                Your Sui wallet is successfully connected to Kaivalya.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">Address</div>
                <div className="font-mono text-sm break-all">{address}</div>
              </div>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex justify-center items-center h-full">
        <Card className="w-full max-w-md bg-card/60 backdrop-blur-sm border-border/50 rounded-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Welcome to Kaivalya</CardTitle>
            <CardDescription>
              Connect your Sui wallet to get started as a contributor or buyer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <ConnectButton />
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                The button above will show all available wallets automatically
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
