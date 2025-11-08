import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Fingerprint } from 'lucide-react';

export default function WalletConnectPage() {
  return (
    <AppShell
      title="Connect Your Wallet"
      description="Onboard with your wallet and decentralized identity."
    >
      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Welcome to Kaivalya</CardTitle>
            <CardDescription>
              Connect your wallet to get started as a contributor or buyer.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button size="lg">
              <Wallet className="mr-2 h-5 w-5" /> Connect with MetaMask
            </Button>
            <Button size="lg" variant="secondary">
              <Wallet className="mr-2 h-5 w-5" /> Connect with WalletConnect
            </Button>
            <Button size="lg" variant="outline">
              <Fingerprint className="mr-2 h-5 w-5" /> Sign in with World ID
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
