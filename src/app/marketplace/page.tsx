'use client';

import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { CircleDollarSign, Users, Search, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const datasets = [
  { id: '1', name: 'Global Climate Data', description: 'Comprehensive climate metrics from 2000–2024.', category: 'Environment', price: 500, contributors: 150 },
  { id: '2', name: 'Medical Imaging Scans', description: 'A large collection of anonymized MRI scans.', category: 'Healthcare', price: 1200, contributors: 80 },
  { id: '3', name: 'Consumer Spending Habits', description: 'Aggregated retail spending data across various sectors.', category: 'Finance', price: 800, contributors: 300 },
  { id: '4', name: 'Autonomous Vehicle Logs', description: 'Sensor and telemetry data from self-driving car tests.', category: 'Technology', price: 2500, contributors: 45 },
  { id: '5', name: 'Social Media Sentiment Analysis', description: 'Sentiment data for major brands across platforms.', category: 'Marketing', price: 300, contributors: 500 },
  { id: '6', name: 'Genomic Sequences', description: 'Anonymized human genomic data for research.', category: 'Biotech', price: 5000, contributors: 25 },
];

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortOption, setSortOption] = useState('');

  // Reset all filters
  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setSortOption('');
  };

  // Filter + sort logic
  const filteredDatasets = useMemo(() => {
    let result = datasets.filter((d) =>
      [d.name, d.description, d.category]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    if (category) {
      result = result.filter(
        (d) => d.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (sortOption === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortOption === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sortOption === 'popular') result.sort((a, b) => b.contributors - a.contributors);

    return result;
  }, [searchTerm, category, sortOption]);

  return (
    <AppShell
      title="Marketplace"
      description="Browse and purchase datasets from the community."
    >
      {/* 🔍 Filters + Search */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search datasets..."
            className="pl-10 border border-blue-100 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center justify-end w-full md:w-auto">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[160px] border border-blue-100 rounded-xl">
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

          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[160px] border border-blue-100 rounded-xl">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          <Button
            variant="outline"
            onClick={clearFilters}
            className="border border-blue-300 text-[#007BFF] hover:bg-blue-50 hover:scale-105 transition-all duration-200 rounded-xl flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      {/* ⚡ Futuristic Data Grid */}
      <div className="rounded-2xl border border-blue-100 bg-white/60 backdrop-blur-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1.5fr,1fr,2fr,1fr,1fr,1fr] items-center px-6 py-3 bg-blue-50/50 text-[#003366] text-xs font-semibold uppercase tracking-wide">
          <div>Dataset Name</div>
          <div>Category</div>
          <div>Description</div>
          <div className="text-center">Price</div>
          <div className="text-center">Contributors</div>
          <div className="text-center">Action</div>
        </div>

        {filteredDatasets.length > 0 ? (
          <div className="divide-y divide-blue-50">
            {filteredDatasets.map((dataset) => (
              <div
                key={dataset.id}
                className="grid grid-cols-[1.5fr,1fr,2fr,1fr,1fr,1fr] items-center px-6 py-5 text-sm text-[#002B5B] hover:bg-blue-50/40 transition-all duration-300 hover:shadow-[0_0_8px_rgba(0,123,255,0.1)]"
              >
                <div className="font-medium">{dataset.name}</div>
                <div>
                  <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {dataset.category}
                  </Badge>
                </div>
                <div className="text-muted-foreground text-xs pr-4">{dataset.description}</div>
                <div className="flex justify-center items-center gap-1 font-semibold text-[#007BFF]">
                  <CircleDollarSign className="h-4 w-4" /> {dataset.price}
                </div>
                <div className="flex justify-center items-center gap-1 text-blue-600">
                  <Users className="h-4 w-4" /> {dataset.contributors}
                </div>
                <div className="flex justify-center">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-[#007BFF] to-[#00BFFF] text-white text-xs px-3 py-1.5 rounded-lg hover:scale-105 hover:shadow-md transition-all duration-200"
                  >
                    <Link href={`/marketplace/${dataset.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-[#003366]/60 py-10 text-sm">
            No datasets match your filters.
          </div>
        )}
      </div>
    </AppShell>
  );
}
