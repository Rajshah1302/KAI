import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { CircleDollarSign, Users } from 'lucide-react';

const datasets = [
    { id: '1', name: 'Global Climate Data', description: 'Comprehensive climate metrics from 2000-2024.', category: 'Environment', price: 500, contributors: 150 },
    { id: '2', name: 'Medical Imaging Scans', description: 'A large collection of anonymized MRI scans.', category: 'Healthcare', price: 1200, contributors: 80 },
    { id: '3', name: 'Consumer Spending Habits', description: 'Aggregated retail spending data across various sectors.', category: 'Finance', price: 800, contributors: 300 },
    { id: '4', name: 'Autonomous Vehicle Logs', description: 'Sensor and telemetry data from self-driving car tests.', category: 'Technology', price: 2500, contributors: 45 },
    { id: '5', name: 'Social Media Sentiment Analysis', description: 'Sentiment data for major brands across platforms.', category: 'Marketing', price: 300, contributors: 500 },
    { id: '6', name: 'Genomic Sequences', description: 'Anonymized human genomic data for research.', category: 'Biotech', price: 5000, contributors: 25 },
];


export default function MarketplacePage() {
  return (
    <AppShell
      title="Marketplace"
      description="Browse and purchase datasets from the community."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {datasets.map((dataset) => (
          <Card key={dataset.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                  <span>{dataset.name}</span>
                  <Badge variant="outline">{dataset.category}</Badge>
              </CardTitle>
              <CardDescription>{dataset.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                      <CircleDollarSign className="h-4 w-4"/>
                      <span>{dataset.price} KAI</span>
                  </div>
                  <div className="flex items-center gap-1">
                      <Users className="h-4 w-4"/>
                      <span>{dataset.contributors} contributors</span>
                  </div>
              </div>
              <Button asChild className="w-full">
                <Link href={`/marketplace/${dataset.id}`}>View & Purchase</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
