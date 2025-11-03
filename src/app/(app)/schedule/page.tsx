'use client';

import { useState, useCallback, useMemo } from 'react';
import { Plus, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { INITIAL_SEEDS } from '@/lib/data';
import type { ScheduledTask, LogEntry, Seed } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScheduleDialog } from '@/components/app/schedule/schedule-dialog';
import { LogDialog } from '@/components/app/logs/log-dialog';
import { isAfter, differenceInDays, isPast } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useTasks } from '@/hooks/use-tasks';

export default function SchedulePage() {
  const [scheduledTasks, setScheduledTasks] = useLocalStorage<ScheduledTask[]>('scheduledTasks', []);
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('logs', []);
  const [seeds, setSeeds] = useLocalStorage<Seed[]>('seeds', INITIAL_SEEDS);
  const { allTasks, getTaskById } = useTasks();
  const { toast } = useToast();

  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduledTask | undefined>(undefined);
  const [logTemplate, setLogTemplate] = useState<Partial<LogEntry> | undefined>(undefined);

  const handleAdd = useCallback(() => {
    setEditingTask(undefined);
    setScheduleDialogOpen(true);
  }, []);

  const handleEdit = useCallback((task: ScheduledTask) => {
    setEditingTask(task);
    setScheduleDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setScheduledTasks(currentTasks => currentTasks.filter((task) => task.id !== id));
    toast({
      title: 'Task Deleted',
      description: 'The scheduled task has been removed.',
    });
  }, [setScheduledTasks, toast]);

  const handleSave = useCallback((task: ScheduledTask) => {
    if (editingTask) {
      setScheduledTasks(currentTasks => currentTasks.map((t) => (t.id === task.id ? task : t)));
    } else {
      setScheduledTasks(currentTasks => [...currentTasks, task]);
    }
  }, [editingTask, setScheduledTasks]);

  const handleLogSave = useCallback((log: LogEntry) => {
    setLogs(currentLogs => {
        const existingLogIndex = currentLogs.findIndex(l => l.id === log.id);
        if (existingLogIndex > -1) {
           return currentLogs.map((l, index) => index === existingLogIndex ? log : l);
        } else {
           return [log, ...currentLogs];
        }
    });
  }, [setLogs]);
  
  const handleCompleteTask = useCallback((task: ScheduledTask) => {
     const newLog: LogEntry = {
      id: crypto.randomUUID(),
      taskId: task.taskId,
      date: new Date().toISOString(),
      notes: `Completed from schedule: ${getTaskById(task.taskId)?.name}`,
    };
    setLogs(currentLogs => [newLog, ...currentLogs]);
    toast({
        title: "Task Completed!",
        description: `Logged "${getTaskById(task.taskId)?.name}".`,
        action: (
          <Button asChild variant="secondary" size="sm">
            <Link href="/logs">View Log</Link>
          </Button>
        ),
      });
  }, [getTaskById, setLogs, toast]);

  const isTaskOverdue = useCallback((task: ScheduledTask): boolean => {
    const lastLog = logs
      .filter(log => log.taskId === task.taskId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!lastLog) {
      return task.startDate ? isPast(new Date(task.startDate)) : false;
    }
    
    const lastDate = new Date(lastLog.date);
    const today = new Date();
    const daysSinceLast = differenceInDays(today, lastDate);

    switch (task.recurrence) {
        case 'daily': return daysSinceLast > 1;
        case 'weekly': return daysSinceLast > 7;
        case 'bi-weekly': return daysSinceLast > 14;
        case 'monthly': return daysSinceLast > 30;
        default: return false;
    }
  }, [logs]);

  const activeScheduledTasks = useMemo(() => {
    return scheduledTasks.filter(task => 
        !task.startDate || isAfter(new Date(), new Date(task.startDate)) || differenceInDays(new Date(task.startDate), new Date()) <= 0
      ).sort((a, b) => (getTaskById(a.taskId)?.name || '').localeCompare(getTaskById(b.taskId)?.name || ''));
  }, [scheduledTasks, getTaskById]);


  return (
    <>
      <PageHeader title="Task Schedule">
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </PageHeader>
      
      {activeScheduledTasks.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activeScheduledTasks.map((scheduledTask) => {
            const taskInfo = getTaskById(scheduledTask.taskId);
            const Icon = taskInfo?.icon;
            const overdue = isTaskOverdue(scheduledTask);
            return (
              <Card key={scheduledTask.id} className={overdue ? "border-destructive" : ""}>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className="flex items-center gap-3">
                        {Icon && <Icon className="h-8 w-8 text-primary" />}
                        <div>
                            <CardTitle className="font-headline flex items-center gap-2">
                              {taskInfo?.name || 'Unknown Task'}
                              {overdue && <Badge variant="destructive">Overdue</Badge>}
                            </CardTitle>
                            <CardDescription className="capitalize">{scheduledTask.recurrence}</CardDescription>
                        </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{scheduledTask.notes || 'No additional notes.'}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCompleteTask(scheduledTask)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleEdit(scheduledTask)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this scheduled task.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(scheduledTask.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center h-80">
          <h3 className="text-2xl font-bold tracking-tight">No scheduled tasks</h3>
          <p className="text-muted-foreground">Get started by creating a new recurring task.</p>
          <Button className="mt-4" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      )}

      <ScheduleDialog
        isOpen={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        onSave={handleSave}
        scheduledTask={editingTask}
        tasks={allTasks}
      />
      
      <LogDialog
        isOpen={logDialogOpen}
        onOpenChange={setLogDialogOpen}
        onSave={handleLogSave}
        log={logTemplate}
        tasks={allTasks}
        seeds={seeds}
       />
    </>
  );
}
