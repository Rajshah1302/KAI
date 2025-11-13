"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUp, FileText, CircleDollarSign, Coins, PlusCircle, ThumbsDown, ThumbsUp, Eye, Clock } from "lucide-react";

const chartData = [
  { month: "Jan", earnings: 186 },
  { month: "Feb", earnings: 305 },
  { month: "Mar", earnings: 237 },
  { month: "Apr", earnings: 273 },
  { month: "May", earnings: 209 },
  { month: "Jun", earnings: 420 },
];

const chartConfig = {
  earnings: {
    label: "Earnings (KAI)",
    color: "hsl(var(--primary))",
  },
};

const contributionHistory = [
    {id: 1, dataset: "NYC Taxi Data Q1 2023", date: "2024-06-15", status: "Approved", earnings: "150 KAI"},
    {id: 2, dataset: "Weather Data - SF", date: "2024-05-20", status: "Approved", earnings: "80 KAI"},
    {id: 3, dataset: "Patient Study #123 (Anonymized)", date: "2024-04-30", status: "Pending", earnings: "-"},
    {id: 4, dataset: "Retail Foot Traffic Analysis", date: "2024-03-10", status: "Approved", earnings: "220 KAI"},
    {id: 5, dataset: "Autonomous Vehicle Sensor Data", date: "2024-02-18", status: "Rejected", earnings: "-"},
];

const defaultProposals = [
    { id: 1, title: 'Approve new dataset: "NYC Taxi Rides"', status: 'Active', type: 'Dataset Approval', votes_for: 72, votes_against: 8, end_date: '3 days remaining' },
    { id: 2, title: 'Create new category: "Geospatial Data"', status: 'Passed', type: 'Category Creation', votes_for: 88, votes_against: 12, end_date: 'Ended 2 weeks ago' },
    { id: 4, title: 'Set price for "Medical Imaging Scans"', status: 'Active', type: 'Pricing', votes_for: 34, votes_against: 16, end_date: '1 day remaining' },
    { id: 3, title: 'Update DAO governance charter', status: 'Failed', type: 'Governance', votes_for: 40, votes_against: 60, end_date: 'Ended 1 month ago' },
];

export default function DashboardPage() {
  const [proposals, setProposals] = useState(defaultProposals);

  useEffect(() => {
    try {
      const storedProposals = JSON.parse(localStorage.getItem('proposals') || '[]');
      const combined = [...defaultProposals];
      const storedIds = new Set(combined.map(p => p.id));
      for (const stored of storedProposals) {
        if (!storedIds.has(stored.id)) {
          combined.push(stored);
        }
      }
      setProposals(combined);
    } catch (e) {
      console.error("Could not load proposals from local storage", e);
      setProposals(defaultProposals);
    }
  }, []);

  return (
    <AppShell>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Contributor Dashboard</h1>
          <p className="text-muted-foreground">Track your data contributions, token balance, and earnings.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,250</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Token Balance</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5,000 KAI</div>
              <p className="text-xs text-muted-foreground">Staked: 2,000 KAI</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 since last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">83.3%</div>
              <p className="text-xs text-muted-foreground">Based on 12 submissions</p>
            </CardContent>
          </Card>
        </div>
         <div className="mt-8 grid gap-8 md:grid-cols-5">
            <Card className="md:col-span-3">
                <CardHeader>
                    <CardTitle>Earnings Over Time</CardTitle>
                    <CardDescription>Your monthly KAI token earnings from data contributions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                      <AreaChart
                          accessibilityLayer
                          data={chartData}
                          margin={{ left: 12, right: 12, top: 10, bottom: 10 }}
                      >
                          <CartesianGrid vertical={false} />
                          <XAxis
                              dataKey="month"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tickFormatter={(value) => value.slice(0, 3)}
                          />
                          <YAxis 
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                          />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                          <defs>
                              <linearGradient id="fillEarnings" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="var(--color-earnings)" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="var(--color-earnings)" stopOpacity={0.1} />
                              </linearGradient>
                          </defs>
                          <Area
                              dataKey="earnings"
                              type="natural"
                              fill="url(#fillEarnings)"
                              fillOpacity={0.4}
                              stroke="var(--color-earnings)"
                              stackId="a"
                          />
                      </AreaChart>
                  </ChartContainer>
                </CardContent>
            </Card>
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Contribution History</CardTitle>
                    <CardDescription>A log of your recent data submissions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Dataset</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contributionHistory.slice(0,4).map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="font-medium">{item.dataset}</div>
                                        <div className="text-sm text-muted-foreground">{item.date}</div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={
                                            item.status === "Approved" ? "default" 
                                            : item.status === "Pending" ? "secondary" 
                                            : "destructive"
                                        }>{item.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Governance & Proposals</h2>
                    <p className="text-muted-foreground">Vote on dataset approvals, category creation, pricing, and other DAO matters.</p>
                </div>
                <Button asChild>
                    <Link href="/governance/create">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create New Proposal
                    </Link>
                </Button>
              </div>
              <div className="grid gap-6">
                {proposals.map((proposal) => {
                    const totalVotes = proposal.votes_for + proposal.votes_against;
                    const forPercentage = totalVotes > 0 ? (proposal.votes_for / totalVotes) * 100 : 0;
                    const againstPercentage = totalVotes > 0 ? (proposal.votes_against / totalVotes) * 100 : 0;

                    const getStatusClasses = () => {
                        switch (proposal.status) {
                            case 'Active': return { badge: 'default', border: 'border-primary', iconColor: 'text-primary' };
                            case 'Passed': return { badge: 'default', border: 'border-green-600', iconColor: 'text-green-600' };
                            case 'Failed': return { badge: 'destructive', border: 'border-red-600', iconColor: 'text-red-600' };
                            default: return { badge: 'secondary', border: 'border-border', iconColor: 'text-muted-foreground' };
                        }
                    }

                    const { border, iconColor } = getStatusClasses();
                    
                    const getBadgeClass = () => {
                        switch(proposal.status) {
                            case 'Passed': return 'bg-green-600 hover:bg-green-700';
                            case 'Failed': return 'bg-red-600';
                            case 'Active': return 'bg-primary hover:bg-primary/80';
                            default: return 'bg-gray-500';
                        }
                    }

                    return (
                      <Card key={proposal.id} className={`transition-all hover:shadow-md ${border}`}>
                        <CardHeader>
                          <div className="flex justify-between items-start gap-4">
                            <CardTitle className="text-lg font-semibold">{proposal.title}</CardTitle>
                            <Badge className={getBadgeClass()}>{proposal.status}</Badge>
                          </div>
                          <CardDescription className="flex items-center gap-4 text-xs pt-1">
                              <Badge variant="outline">{proposal.type}</Badge>
                              <div className={`flex items-center gap-1.5 ${iconColor}`}>
                                <Clock className="h-3 w-3" />
                                <span>{proposal.end_date}</span>
                              </div>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {(proposal.status === 'Active' || proposal.status === 'Passed' || proposal.status === 'Failed') && (
                                <div className="space-y-2">
                                   <div className="relative h-3 w-full rounded-full overflow-hidden bg-secondary">
                                        <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${forPercentage}%` }} />
                                        <div className="absolute top-0 right-0 h-full bg-red-500" style={{ width: `${againstPercentage}%` }} />
                                    </div>
                                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                        <span className="text-green-600">Yes: {proposal.votes_for} ({forPercentage.toFixed(1)}%)</span>
                                        <span className="text-red-600">No: {proposal.votes_against} ({againstPercentage.toFixed(1)}%)</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2 flex-wrap items-center border-t pt-4 mt-2">
                                {proposal.status === 'Active' && (
                                  <>
                                    <Button variant="outline" size="sm" className="hover:bg-green-100 dark:hover:bg-green-900/50 hover:text-green-800 border-green-300">
                                        <ThumbsUp className="mr-2 h-4 w-4"/>Vote Yes
                                    </Button>
                                    <Button variant="outline" size="sm" className="hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-800 border-red-300">
                                        <ThumbsDown className="mr-2 h-4 w-4"/>Vote No
                                    </Button>
                                  </>
                                )}
                                <Button variant="ghost" size="sm" className="ml-auto">
                                    <Eye className="mr-2 h-4 w-4"/>View Details
                                </Button>
                            </div>
                        </CardContent>
                      </Card>
                    )
                })}
              </div>
        </div>
    </AppShell>
  );
}
