import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <AppShell
      title="Contributor Dashboard"
      description="Track your data contributions, token balance, and earnings."
    >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">12</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Token Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">5,000 KAI</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$1,250</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Your Datasets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">5</p>
            </CardContent>
          </Card>
        </div>
         <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Contribution History</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Your contribution history will be displayed here.</p>
                </CardContent>
            </Card>
        </div>
    </AppShell>
  );
}
