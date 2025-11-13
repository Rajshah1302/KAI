'use client';

import { useState, useMemo, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleDollarSign, Users, Search, XCircle, Tag, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const defaultDatasets = [
  { id: '1', name: 'Global Climate Data', description: 'Comprehensive climate metrics from 2000–2024.', category: 'Environment', price: 500, contributors: 150 },
  { id: '2', name: 'Medical Imaging Scans', description: 'A large collection of anonymized MRI scans.', category: 'Healthcare', price: 1200, contributors: 80 },
  { id: '3', name: 'Consumer Spending Habits', description: 'Aggregated retail spending data across various sectors.', category: 'Finance', price: 800, contributors: 300 },
  { id: '4', name: 'Autonomous Vehicle Logs', description: 'Sensor and telemetry data from self-driving car tests.', category: 'Technology', price: 2500, contributors: 45 },
  { id: '5', name: 'Social Media Sentiment Analysis', description: 'Sentiment data for major brands across platforms.', category: 'Marketing', price: 300, contributors: 500 },
  { id: '6', name: 'Genomic Sequences', description: 'Anonymized human genomic data for research.', category: 'Biotech', price: 5000, contributors: 25 },
];

const allCategories = ['all', ...new Set(defaultDatasets.map(d => d.category)), "User Contributed"];

export default function MarketplacePage() {
  const [datasets, setDatasets] = useState(defaultDatasets);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortOption, setSortOption] = useState('popular');

  useEffect(() => {
    try {
      const storedDatasets = JSON.parse(localStorage.getItem('datasets') || '[]');
      const combined = [...defaultDatasets];
      const storedIds = new Set(combined.map(d => d.id));
      for (const stored of storedDatasets) {
        if (!storedIds.has(stored.id)) {
          combined.push(stored);
        }
      }
      setDatasets(combined);
    } catch (e) {
      console.error("Could not load datasets from local storage", e);
      setDatasets(defaultDatasets);
    }
  }, []);

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('all');
    setSortOption('popular');
  };

  const filteredDatasets = useMemo(() => {
    let result = datasets.filter((d) =>
      [d.name, d.description, d.category]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    if (category && category !== 'all') {
      result = result.filter(
        (d) => d.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (sortOption === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortOption === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sortOption === 'popular') result.sort((a, b) => b.contributors - a.contributors);

    return result;
  }, [datasets, searchTerm, category, sortOption]);

  return (
    <AppShell>
      <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">
        {/* Left Sidebar for Filters */}
        <aside className="hidden md:flex flex-col gap-6 sticky top-24 bg-card/50 p-6 rounded-2xl border border-border/50 backdrop-blur-sm">
          <h2 className="text-xl font-semibold">Filters</h2>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search datasets..."
              className="pl-10 bg-background/70"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Category</h3>
            <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-background/70">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Sort By</h3>
             <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="bg-background/70">
                  <SelectValue placeholder="Relevance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
          </div>
          
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground justify-center"
          >
            <XCircle className="h-4 w-4" />
            Clear All Filters
          </Button>
        </aside>

        {/* Main Content */}
        <main>
          {filteredDatasets.length > 0 ? (
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDatasets.map((dataset) => (
                <Card key={dataset.id} className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1 bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg">{dataset.name}</CardTitle>
                        <CardDescription className="line-clamp-2 h-10">{dataset.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow grid gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Tag className="h-4 w-4 text-primary"/>
                            <Badge variant="outline">{dataset.category}</Badge>
                        </div>
                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" /> 
                            <span>{dataset.contributors} Contributors</span>
                        </div>
                    </CardContent>
                    <Separator />
                    <CardFooter className="flex justify-between items-center pt-4">
                         <div className="flex items-center gap-2 font-semibold text-foreground">
                            <Coins className="h-5 w-5 text-primary" /> 
                            <span className="text-lg">{dataset.price > 0 ? `${dataset.price} KAI` : 'Not Set'}</span>
                        </div>
                         <Button asChild size="sm" className="bg-primary/90 text-primary-foreground hover:bg-primary hover:scale-105 transition-transform rounded-lg">
                            <Link href={`/marketplace/${dataset.id}`}>View</Link>
                        </Button>
                    </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-16">
              <h3 className="text-xl font-semibold">No Datasets Found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </main>
      </div>
    </AppShell>
  );
}
