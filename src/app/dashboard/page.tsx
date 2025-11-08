"use client"

import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUp, FileText, CircleDollarSign, Coins } from "lucide-react";

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

export default function DashboardPage() {
  return (
    <AppShell
      title="Contributor Dashboard"
      description="Track your data contributions, token balance, and earnings."
    >
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
    </AppShell>
  );
}
