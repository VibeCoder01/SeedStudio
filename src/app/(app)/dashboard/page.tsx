
'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Seed, ScheduledTask, LogEntry } from '@/lib/types';
import { INITIAL_SEEDS } from '@/lib/data';
import PageHeader from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { ActivityChart } from '@/components/app/dashboard/activity-chart';
import { HarvestChart } from '@/components/app/dashboard/harvest-chart';
import { useTasks } from '@/hooks/use-tasks';

export default function DashboardPage() {
  const [seeds] = useLocalStorage<Seed[]>('seeds', INITIAL_SEEDS);
  const [scheduledTasks] = useLocalStorage<ScheduledTask[]>('scheduledTasks', []);
  const [logs] = useLocalStorage<LogEntry[]>('logs', []);
  const { allTasks } = useTasks();

  const lowStockSeeds = useMemo(() => seeds.filter((seed) => {
    const threshold = seed.lowStockThreshold ?? 10;
    return !seed.isWishlist && seed.packetCount < threshold;
  }), [seeds]);
  
  const nextTask = useMemo(() => {
    // Simple sort, can be improved with date-fns if more complex logic is needed
    const sortedTasks = [...scheduledTasks].sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
    return sortedTasks.length > 0 ? sortedTasks[0] : null;
  }, [scheduledTasks]);

  const nextTaskInfo = useMemo(() => {
    if (!nextTask) return null;
    return allTasks.find(t => t.id === nextTask.taskId);
  }, [nextTask, allTasks]);

  return (
    <>
      <PageHeader title="Welcome to Your Garden Dashboard" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">At a Glance</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Seed Inventory</CardTitle>
                <CardDescription>
                  {seeds.filter(s => !s.isWishlist).length} types of seeds in stock.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lowStockSeeds.length > 0 ? (
                  <div>
                    <p className="font-bold text-destructive">
                      {lowStockSeeds.length} item(s) are low on packets!
                    </p>
                    <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                      {lowStockSeeds.map((seed) => (
                        <li key={seed.id}>{seed.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p>Your inventory is well-stocked.</p>
                )}
              </CardContent>
              <CardFooter>
                 <Button asChild variant="outline" size="sm">
                    <Link href="/inventory">
                        View Inventory <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Next Task</CardTitle>
                {nextTask && nextTaskInfo ? (
                    <CardDescription>
                        A recurring task from your schedule.
                    </CardDescription>
                ): null}
              </CardHeader>
              <CardContent>
                {nextTask && nextTaskInfo ? (
                  <div>
                    <p className="font-bold capitalize">{nextTaskInfo.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{nextTask.recurrence}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No upcoming tasks scheduled.</p>
                )}
              </CardContent>
               <CardFooter>
                 <Button asChild variant="outline" size="sm">
                    <Link href="/schedule">
                        View Schedule <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
              </CardFooter>
            </Card>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Recent Harvest</CardTitle>
            <CardDescription>A summary of your harvest yields over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <HarvestChart logs={logs} seeds={seeds} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription>
              A summary of your logged activities over the last 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityChart logs={logs} tasks={allTasks} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
