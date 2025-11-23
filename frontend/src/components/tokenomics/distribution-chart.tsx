'use client';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";

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

export default function TokenDistributionChart() {
  return (
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
  );
}
