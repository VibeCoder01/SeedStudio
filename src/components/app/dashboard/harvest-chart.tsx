
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { subDays, isAfter, format } from 'date-fns';
import type { LogEntry, Seed } from '@/lib/types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface HarvestChartProps {
  logs: LogEntry[];
  seeds: Seed[];
}

const chartConfig = {
  weight: {
    label: 'Weight (lbs)',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function HarvestChart({ logs, seeds }: HarvestChartProps) {
  const chartData = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const harvestLogs = logs.filter(
      (log) => log.taskId === 'harvesting' && isAfter(new Date(log.date), thirtyDaysAgo)
    );

    const dataBySeed: { [seedId: string]: { name: string; weight: number } } = {};

    harvestLogs.forEach((log) => {
      if (log.seedId && log.weight) {
        if (!dataBySeed[log.seedId]) {
          const seed = seeds.find((s) => s.id === log.seedId);
          dataBySeed[log.seedId] = {
            name: seed?.name || 'Unknown',
            weight: 0,
          };
        }
        dataBySeed[log.seedId].weight += log.weight;
      }
    });

    return Object.values(dataBySeed)
        .filter(d => d.weight > 0)
        .sort((a,b) => b.weight - a.weight);

  }, [logs, seeds]);

  if (chartData.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center h-60">
            <h3 className="text-xl font-bold tracking-tight">No harvests logged yet</h3>
            <p className="text-muted-foreground">Log your first harvest to see a chart here.</p>
            <Button className="mt-4" asChild>
                <Link href="/logs">
                    Add a Log
                </Link>
            </Button>
        </div>
    );
  }

  return (
      <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
        <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            className="capitalize"
            width={100}
            interval={0}
          />
          <XAxis dataKey="weight" type="number" hide />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="weight" layout="vertical" radius={5} />
        </BarChart>
      </ChartContainer>
  );
}
