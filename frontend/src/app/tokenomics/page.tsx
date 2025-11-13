"use client"

import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";
import { Coins, Database, Zap, Users, Shield, Award, Briefcase, GitPullRequest } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const tokenDistributionData = [
  { browser: 'Community Treasury', value: 40, fill: 'hsl(var(--chart-1))' },
  { browser: 'Contributors & Rewards', value: 25, fill: 'hsl(var(--chart-2))' },
  { browser: 'Ecosystem Development', value: 15, fill: 'hsl(var(--chart-3))' },
  { browser: 'Team & Advisors', value: 10, fill: 'hsl(var(--chart-4))' },
  { browser: 'Public Sale', value: 10, fill: 'hsl(var(--chart-5))' },
];

const chartConfig = {
  value: {
    label: 'Value',
  },
  'Community Treasury': {
    label: 'Community Treasury',
    color: 'hsl(var(--chart-1))',
  },
  'Contributors & Rewards': {
    label: 'Contributors & Rewards',
    color: 'hsl(var(--chart-2))',
  },
  'Ecosystem Development': {
    label: 'Ecosystem Development',
    color: 'hsl(var(--chart-3))',
  },
  'Team & Advisors': {
    label: 'Team & Advisors',
    color: 'hsl(var(--chart-4))',
  },
  'Public Sale': {
    label: 'Public Sale',
    color: 'hsl(var(--chart-5))',
  },
};

const tokenUtilities = [
    { icon: <Database className="h-6 w-6 text-primary"/>, title: "Data Purchase", description: "Acquire datasets from the marketplace using KAI tokens." },
    { icon: <GitPullRequest className="h-6 w-6 text-primary"/>, title: "Governance Voting", description: "Stake KAI to vote on proposals and influence the DAO's direction." },
    { icon: <Award className="h-6 w-6 text-primary"/>, title: "Contributor Rewards", description: "Earn KAI by donating valuable and verified data to the DAO." },
    { icon: <Shield className="h-6 w-6 text-primary"/>, title: "Staking", description: "Stake KAI to earn a share of marketplace fees and secure the network." },
]

export default function TokenomicsPage() {
  return (
    <AppShell>
      <div className="grid gap-8 md:grid-cols-3">
         <Card className="md:col-span-1 bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50">
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
                    <span className="font-bold">SUI</span>
                </div>
            </CardContent>
        </Card>
        <Card className="md:col-span-2 flex flex-col bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50">
          <CardHeader>
            <CardTitle>Token Distribution</CardTitle>
            <CardDescription>Allocation of the total KAI token supply.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0 flex items-center justify-center">
             <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square h-full max-h-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={tokenDistributionData}
                  dataKey="value"
                  nameKey="browser"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  {tokenDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Card className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50">
            <CardHeader>
                <CardTitle>Token Utility</CardTitle>
                <CardDescription>The primary uses for the KAI token within the ecosystem.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {tokenUtilities.map(utility => (
                    <div key={utility.title} className="flex flex-col items-center text-center p-4 rounded-xl bg-background/50 border">
                        <div className="mb-4 rounded-full bg-primary/10 p-3">
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
