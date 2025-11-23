'use client';

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
    <AppShell>
        <div className="grid gap-4">
            {purchasedDatasets.map(dataset => (
                <Card key={dataset.id} className="bg-card/60 backdrop-blur-sm border-border/50 rounded-2xl">
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
