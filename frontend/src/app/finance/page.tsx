'use client';

import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, PiggyBank, Receipt, TrendingUp, RefreshCw } from 'lucide-react';

export default function FinancePage() {
  return (
    <AppShell>
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Treasury & Profit Sharing</h1>
            <p className="text-muted-foreground">View DAO treasury details, manage KAI tokens, and redeem SUI.</p>
        </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-6 w-6" />
              DAO SUI Treasury
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Current Treasury Balance (SUI)</p>
              <p className="text-4xl font-bold flex items-center gap-2">
                250,000 SUI
              </p>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>+5.8% growth in the last 30 days from marketplace fees.</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-6 w-6" />
              Redeem SUI
            </CardTitle>
            <CardDescription>Burn KAI to redeem your proportional share of the SUI treasury.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4">
              <div>
                 <p className="text-sm text-muted-foreground">Your KAI Balance</p>
                 <p className="text-4xl font-bold flex items-center gap-2">
                    <Coins className="h-7 w-7 text-primary" />
                    5,000 KAI
                </p>
              </div>
            <Button className="w-full" size="lg">Burn KAI for SUI</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
