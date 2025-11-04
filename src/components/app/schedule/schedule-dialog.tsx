'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { ScheduledTask, TaskType, Recurrence } from '@/lib/types';
import { recurrences } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  taskId: z.string().min(1, 'Please select an activity.'),
  recurrence: z.enum(recurrences, { required_error: 'Please select a recurrence.' }),
  notes: z.string().optional(),
  startDate: z.date().optional(),
});

type ScheduleFormValues = z.infer<typeof formSchema>;

interface ScheduleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: ScheduledTask) => void;
  scheduledTask?: Partial<ScheduledTask>;
  tasks: TaskType[];
}

export function ScheduleDialog({ isOpen, onOpenChange, onSave, scheduledTask, tasks }: ScheduleDialogProps) {
  const { toast } = useToast();
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        taskId: scheduledTask?.taskId || '',
        recurrence: scheduledTask?.recurrence || 'weekly',
        notes: scheduledTask?.notes || '',
        startDate: scheduledTask?.startDate ? new Date(scheduledTask.startDate) : undefined,
      });
    }
  }, [scheduledTask, form, isOpen]);

  const onSubmit = (data: ScheduleFormValues) => {
    const newScheduledTask: ScheduledTask = {
      id: scheduledTask?.id || crypto.randomUUID(),
      taskId: data.taskId,
      recurrence: data.recurrence,
      notes: data.notes || '',
      startDate: data.startDate?.toISOString(),
    };
    
    onSave(newScheduledTask);
    onOpenChange(false);
    
    toast({
      title: scheduledTask?.id ? 'Task Updated' : 'Task Scheduled',
      description: 'Your task schedule has been updated.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{scheduledTask?.id ? 'Edit Scheduled Task' : 'Add New Scheduled Task'}</DialogTitle>
          <DialogDescription>
            {scheduledTask?.id ? 'Update the details for this task.' : 'Set up a new recurring task.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="taskId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an activity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
              <FormField
                control={form.control}
                name="recurrence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurrence</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select how often" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {recurrences.map((r) => (
                          <SelectItem key={r} value={r} className="capitalize">
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                    Tasks will appear on your schedule based on this recurrence.
                  </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any details about the task..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
