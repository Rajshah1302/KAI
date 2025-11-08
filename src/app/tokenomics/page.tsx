
"use client"

import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts";
import { Coins, Database, Zap, Users, Shield, Award, Briefcase, GitPullRequest } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const tokenDistributionData = [
  { name: 'Community Treasury', value: 40, color: 'hsl(var(--chart-1))' },
  { name: 'Contributors & Rewards', value: 25, color: 'hsl(var(--chart-2))' },
  { name: 'Ecosystem Development', value: 15, color: 'hsl(var(--chart-3))' },
  { name: 'Team & Advisors', value: 10, color: 'hsl(var(--chart-4))' },
  { name: 'Public Sale', value: 10, color: 'hsl(var(--chart-5))' },
];

const tokenUtilities = [
    { icon: <Database className="h-6 w-6 text-primary"/>, title: "Data Purchase", description: "Acquire datasets from the marketplace using KAI tokens." },
    { icon: <GitPullRequest className="h-6 w-6 text-primary"/>, title: "Governance Voting", description: "Stake KAI to vote on proposals and influence the DAO's direction." },
    { icon: <Award className="h-6 w-6 text-primary"/>, title: "Contributor Rewards", description: "Earn KAI by donating valuable and verified data to the DAO." },
    { icon: <Shield className="h-6 w-6 text-primary"/>, title: "Staking", description: "Stake KAI to earn a share of marketplace fees and secure the network." },
]

export default function TokenomicsPage() {
  return (
    <AppShell
      title="KAI Tokenomics"
      description="Understanding the economy of the Kaivalya DAO."
    >
      <div className="grid gap-8 md:grid-cols-3">
         <Card className="md:col-span-1">
            <CardHeader>
                <CardTitle>Token Overview</CardTitle>
                <CardDescription>Key details about the KAI token.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-muted-foreground">Token Name</span>
                    <span className="font-bold">Kaivalya Token</span>
                </div>
                 <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-muted-foreground">Ticker</span>
                    <Badge variant="secondary">KAI</Badge>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-muted-foreground">Total Supply</span>
                    <span className="font-bold">1,000,000,000</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Token Type</span>
                    <span className="font-bold">ERC-20</span>
                </div>
            </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Token Distribution</CardTitle>
            <CardDescription>Allocation of the total KAI token supply.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                        data={tokenDistributionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="hsl(var(--primary))"
                        strokeWidth={2}
                    >
                    {tokenDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    </Pie>
                     <Legend
                        content={({ payload }) => {
                          return (
                            <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-sm">
                              {payload?.map((entry, index) => (
                                <li key={`item-${index}`} className="flex items-center gap-2">
                                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                  <span>{entry.value} ({tokenDistributionData[index].value}%)</span>
                                </li>
                              ))}
                            </ul>
                          )
                        }}
                      />
                </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Token Utility</CardTitle>
                <CardDescription>The primary uses for the KAI token within the ecosystem.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {tokenUtilities.map(utility => (
                    <div key={utility.title} className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                        <div className="mb-4 rounded-full bg-background p-3">
                            {utility.icon}
                        </div>
                        <h3 className="font-semibold mb-1">{utility.title}</h3>
                        <p className="text-muted-foreground text-sm">{utility.description}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
