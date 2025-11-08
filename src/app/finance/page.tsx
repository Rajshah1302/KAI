import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, PiggyBank, Receipt, TrendingUp } from 'lucide-react';

export default function FinancePage() {
  return (
    <AppShell
      title="Treasury & Profit Sharing"
      description="View DAO treasury details and manage your rewards."
    >
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-6 w-6" />
              DAO Treasury Status
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Current Treasury Balance</p>
              <p className="text-4xl font-bold flex items-center gap-2">
                <Coins className="h-8 w-8 text-primary" />
                1,250,000 KAI
              </p>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>+5.8% growth in the last 30 days.</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-6 w-6" />
              Your Claimable Rewards
            </CardTitle>
            <CardDescription>Rewards are distributed from marketplace fees.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4">
              <div>
                 <p className="text-sm text-muted-foreground">Available to Claim</p>
                 <p className="text-4xl font-bold">350 KAI</p>
              </div>
            <Button className="w-full" size="lg">Claim Rewards</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
