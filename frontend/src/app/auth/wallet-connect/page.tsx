'use client';

import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, CheckCircle2 } from 'lucide-react';
import { ConnectButton } from '@mysten/dapp-kit';
import { useSuiWallet, useAvailableWallets } from '@/hooks/use-sui-wallet';

export default function WalletConnectPage() {
  const { isConnected, address, displayName } = useSuiWallet();
  const { configuredWallets, availableWallets } = useAvailableWallets();

  if (isConnected && address) {
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
                {displayName && (
                  <>
                    <div className="text-sm text-muted-foreground mt-3 mb-1">SuiNS Name</div>
                    <div className="font-medium">{displayName}</div>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <ConnectButton
                  connectText="Switch Wallet"
                />
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
            {/* Main Connect Button */}
            <div>
              <ConnectButton
                connectText={
                  <span className="flex items-center justify-center gap-2 w-full">
                    <Wallet className="h-5 w-5" />
                    Connect Sui Wallet
                  </span>
                }
                className="w-full"
              />
            </div>

            {/* Installed Wallets */}
            {configuredWallets.length > 0 && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Installed Wallets
                </div>
                <div className="space-y-2">
                  {configuredWallets.map((wallet) => (
                    <ConnectButton
                      key={wallet.name}
                      connectText={
                        <span className="flex items-center gap-2 w-full">
                          {wallet.icon && (
                            <img src={wallet.icon} alt={wallet.name} className="w-5 h-5" />
                          )}
                          Connect {wallet.name}
                        </span>
                      }
                      className="w-full justify-start"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Available Wallets (Not Installed) */}
            {availableWallets.length > 0 && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Available Wallets
                </div>
                <div className="space-y-2">
                  {availableWallets.map((wallet) => (
                    <a
                      key={wallet.name}
                      href={wallet.downloadUrl?.browserExtension}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                    >
                      {wallet.icon && (
                        <img src={wallet.icon} alt={wallet.name} className="w-5 h-5" />
                      )}
                      <span className="flex-1 text-left">Install {wallet.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                Supported wallets: Suiet, Ethos Wallet, Sui Wallet, and more
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
