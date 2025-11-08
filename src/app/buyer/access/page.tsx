import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Key } from 'lucide-react';

const purchasedDatasets = [
    { id: 1, name: 'Global Climate Data' },
    { id: 2, name: 'Consumer Spending Habits' },
];

export default function AccessPage() {
  return (
    <AppShell
      title="Access & Download"
      description="View your purchased datasets and access decryption keys."
    >
        <div className="grid gap-4">
            {purchasedDatasets.map(dataset => (
                <Card key={dataset.id}>
                    <CardHeader>
                        <CardTitle>{dataset.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <Button>
                            <Download className="mr-2 h-4 w-4" /> Download Data
                        </Button>
                        <Button variant="outline">
                            <Key className="mr-2 h-4 w-4" /> Get Decryption Key
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    </AppShell>
  );
}
