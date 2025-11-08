import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FinancePage() {
  return (
    <AppShell
      title="Treasury & Profit Sharing"
      description="View DAO treasury details and claim your rewards."
    >
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>DAO Treasury</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">1,250,000 KAI</p>
            <p className="text-muted-foreground">Current treasury balance.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Claimable Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">350 KAI</p>
            <Button className="mt-4">Claim Rewards</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
