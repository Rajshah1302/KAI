"use client"

import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";
import { Users, Coins, ArrowRightLeft } from 'lucide-react';

const userGrowthData = [
  { month: "Jan", users: 86 },
  { month: "Feb", users: 205 },
  { month: "Mar", users: 437 },
  { month: "Apr", users: 573 },
  { month: "May", users: 709 },
  { month: "Jun", users: 920 },
  { month: "Jul", users: 1150 },
];

const transactionData = [
  { date: "2024-07-01", transactions: 250 },
  { date: "2024-07-02", transactions: 300 },
  { date: "2024-07-03", transactions: 280 },
  { date: "2024-07-04", transactions: 450 },
  { date: "2024-07-05", transactions: 400 },
  { date: "2024-07-06", transactions: 500 },
  { date: "2024-07-07", transactions: 480 },
];

const accessLogs = [
    {id: 1, user: "0xAb...c1dE", action: "DOWNLOAD", dataset: "Global Climate Data", timestamp: "2024-07-21 10:30 AM"},
    {id: 2, user: "0xAb...c1dE", action: "GET_KEY", dataset: "Global Climate Data", timestamp: "2024-07-21 10:29 AM"},
    {id: 3, user: "0x12...34fG", action: "DOWNLOAD", dataset: "Medical Imaging Scans", timestamp: "2024-07-20 04:15 PM"},
    {id: 4, user: "0x56...78hI", action: "VOTE_YES", proposal: "Update DAO Charter", timestamp: "2024-07-20 01:00 PM"},
    {id: 5, user: "0x9a...bcJk", action: "UPLOAD", dataset: "New Sensor Data", timestamp: "2024-07-19 09:05 AM"},
]

const userChartConfig = { users: { label: "Users", color: "hsl(var(--chart-2))" }};
const transactionChartConfig = { transactions: { label: "Transactions", color: "hsl(var(--chart-1))" }};

export default function AnalyticsPage() {
  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Analytics & Management</h1>
        <p className="text-muted-foreground">DAO-wide metrics, token stats, and access logs.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,500</div>
              <p className="text-xs text-muted-foreground">+15.2% this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tokens in Circulation</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10,000,000</div>
               <p className="text-xs text-muted-foreground">KAI</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Transactions</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">450</div>
              <p className="text-xs text-muted-foreground">+5.5% from yesterday</p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>Total users in the DAO over time.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={userChartConfig} className="h-[250px] w-full">
                        <BarChart accessibilityLayer data={userGrowthData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar dataKey="users" fill="var(--color-users)" radius={8} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Transaction Volume</CardTitle>
                    <CardDescription>Number of transactions per day.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ChartContainer config={transactionChartConfig} className="h-[250px] w-full">
                        <LineChart accessibilityLayer data={transactionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="transactions" stroke="var(--color-transactions)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
         <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity Logs</CardTitle>
                    <CardDescription>A live feed of important actions within the DAO.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead className="text-right">Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {accessLogs.map(log => (
                               <TableRow key={log.id}>
                                   <TableCell className="font-mono text-xs">{log.user}</TableCell>
                                   <TableCell>
                                       <Badge variant={
                                           log.action === "DOWNLOAD" || log.action === "GET_KEY" ? "default" :
                                           log.action === "UPLOAD" ? "secondary" : "outline"
                                       }>{log.action}</Badge>
                                   </TableCell>
                                   <TableCell className="font-medium">{log.dataset || log.proposal}</TableCell>
                                   <TableCell className="text-right text-muted-foreground">{log.timestamp}</TableCell>
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
