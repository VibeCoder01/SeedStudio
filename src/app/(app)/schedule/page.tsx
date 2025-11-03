'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { DEFAULT_TASK_TYPES } from '@/lib/data';
import type { ScheduledTask, TaskType } from '@/lib/types';
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

export default function SchedulePage() {
  const [scheduledTasks, setScheduledTasks] = useLocalStorage<ScheduledTask[]>('scheduledTasks', []);
  const [customTasks] = useLocalStorage<TaskType[]>('customTasks', []);
  const allTasks = [...DEFAULT_TASK_TYPES, ...customTasks];
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduledTask | undefined>(undefined);

  const getTaskById = (taskId: string) => {
    return allTasks.find(task => task.id === taskId);
  };

  const handleAdd = () => {
    setEditingTask(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (task: ScheduledTask) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setScheduledTasks(scheduledTasks.filter((task) => task.id !== id));
    toast({
      title: 'Task Deleted',
      description: 'The scheduled task has been removed.',
    });
  };

  const handleSave = (task: ScheduledTask) => {
    if (editingTask) {
      setScheduledTasks(scheduledTasks.map((t) => (t.id === task.id ? task : t)));
    } else {
      setScheduledTasks([...scheduledTasks, task]);
    }
  };

  return (
    <>
      <PageHeader title="Task Schedule">
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </PageHeader>
      
      {scheduledTasks.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {scheduledTasks.map((scheduledTask) => {
            const taskInfo = getTaskById(scheduledTask.taskId);
            const Icon = taskInfo?.icon;
            return (
              <Card key={scheduledTask.id}>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className="flex items-center gap-3">
                        {Icon && <Icon className="h-8 w-8 text-primary" />}
                        <div>
                            <CardTitle className="font-headline">{taskInfo?.name || 'Unknown Task'}</CardTitle>
                            <CardDescription className="capitalize">{scheduledTask.recurrence}</CardDescription>
                        </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{scheduledTask.notes || 'No additional notes.'}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
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
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        scheduledTask={editingTask}
        tasks={allTasks}
      />
    </>
  );
}
