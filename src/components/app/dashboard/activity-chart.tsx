
'use client';

import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { subDays, isAfter } from 'date-fns';
import type { LogEntry, TaskType } from '@/lib/types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

interface ActivityChartProps {
  logs: LogEntry[];
  tasks: TaskType[];
}

const chartConfig = {
  count: {
    label: 'Activities',
  },
} satisfies ChartConfig;

function ActivityChartComponent({ logs, tasks }: ActivityChartProps) {
  const chartData = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentLogs = logs.filter((log) => isAfter(new Date(log.date), thirtyDaysAgo));

    const activityCounts = tasks.map((task, index) => ({
      name: task.name,
      count: recentLogs.filter((log) => log.taskId === task.id).length,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`,
    })).filter(item => item.count > 0);

    return activityCounts;
  }, [logs, tasks]);

  if (chartData.length === 0) {
    return null;
  }

  return (
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20}}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis allowDecimals={false} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={4} />
        </BarChart>
      </ChartContainer>
  );
}

export const ActivityChart = React.memo(ActivityChartComponent);
