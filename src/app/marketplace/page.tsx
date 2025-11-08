import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { CircleDollarSign, Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search datasets..." className="pl-10" />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
            <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="environment">Environment</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="biotech">Biotech</SelectItem>
                </SelectContent>
            </Select>
             <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {datasets.map((dataset) => (
          <Card key={dataset.id} className="flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                  <span className="text-lg">{dataset.name}</span>
                  <Badge variant="outline">{dataset.category}</Badge>
              </CardTitle>
              <CardDescription className="flex-grow">{dataset.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-end gap-4 mt-auto">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 font-semibold">
                      <CircleDollarSign className="h-4 w-4 text-primary"/>
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
