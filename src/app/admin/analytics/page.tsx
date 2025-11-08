import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsPage() {
  return (
    <AppShell
      title="Admin Analytics & Management"
      description="DAO-wide metrics, token stats, and access logs."
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">1,500</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tokens in Circulation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">10,000,000 KAI</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Daily Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">450</p>
            </CardContent>
          </Card>
        </div>
         <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Access Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Access logs will be displayed here.</p>
                </CardContent>
            </Card>
        </div>
    </AppShell>
  );
}
