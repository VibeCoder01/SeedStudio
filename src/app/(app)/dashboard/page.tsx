'use client';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Seed, ScheduledTask, LogEntry, TaskType } from '@/lib/types';
import { INITIAL_SEEDS, DEFAULT_TASK_TYPES } from '@/lib/data';
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
import { ArrowRight, Info } from 'lucide-react';
import { ActivityChart } from '@/components/app/dashboard/activity-chart';

export default function DashboardPage() {
  const [seeds] = useLocalStorage<Seed[]>('seeds', INITIAL_SEEDS);
  const [scheduledTasks] = useLocalStorage<ScheduledTask[]>('scheduledTasks', []);
  const [logs] = useLocalStorage<LogEntry[]>('logs', []);
  const [customTasks] = useLocalStorage<TaskType[]>('customTasks', []);
  const allTasks = [...DEFAULT_TASK_TYPES, ...customTasks];

  const lowStockSeeds = seeds.filter((seed) => seed.stock < 10);
  const nextTask = scheduledTasks.length > 0 ? scheduledTasks[0] : null;
  const nextTaskInfo = nextTask ? allTasks.find(t => t.id === nextTask.taskId) : null;

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
                  {seeds.length} types of seeds in stock.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lowStockSeeds.length > 0 ? (
                  <div>
                    <p className="font-bold text-destructive">
                      {lowStockSeeds.length} item(s) are low on stock!
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
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription>
              A summary of your logged activities over the last 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length > 0 ? (
                <ActivityChart logs={logs} tasks={allTasks} />
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center h-60">
                    <h3 className="text-xl font-bold tracking-tight">No activity logged yet</h3>
                    <p className="text-muted-foreground">Log your first activity to see a chart here.</p>
                    <Button className="mt-4" asChild>
                        <Link href="/logs">
                            Add a Log
                        </Link>
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
