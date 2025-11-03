'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Tag } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { DEFAULT_TASK_TYPES } from '@/lib/data';
import type { TaskType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
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

const formSchema = z.object({
  name: z.string().min(2, 'Task name must be at least 2 characters.'),
});

type CustomTaskFormValues = z.infer<typeof formSchema>;

export default function SettingsPage() {
  const [customTasks, setCustomTasks] = useLocalStorage<TaskType[]>('customTasks', []);
  const { toast } = useToast();
  
  const form = useForm<CustomTaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = (data: CustomTaskFormValues) => {
    const newTask: TaskType = {
      id: `custom-${crypto.randomUUID()}`,
      name: data.name,
      icon: Tag,
    };
    setCustomTasks([...customTasks, newTask]);
    form.reset();
    toast({
      title: 'Custom Task Added',
      description: `"${data.name}" has been added to your tasks.`,
    });
  };

  const handleDelete = (id: string) => {
    setCustomTasks(customTasks.filter((task) => task.id !== id));
    toast({
        title: 'Custom Task Removed',
        description: `The task has been removed.`,
        variant: 'destructive',
    });
  };

  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Custom Task Types</CardTitle>
            <CardDescription>
              Create your own task types to use in logs and schedules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="e.g., Fertilizing" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </form>
            </Form>

            <div className="mt-6 space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Default Tasks</h3>
                <ul className="space-y-2">
                    {DEFAULT_TASK_TYPES.map((task) => (
                        <li key={task.id} className="flex items-center justify-between rounded-md border bg-muted/50 p-3">
                            <span className="flex items-center gap-2 font-medium">
                                <task.icon className="h-4 w-4" />
                                {task.name}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Your Custom Tasks</h3>
              {customTasks.length > 0 ? (
                <ul className="space-y-2">
                  {customTasks.map((task) => (
                    <li key={task.id} className="flex items-center justify-between rounded-md border p-3">
                      <span className="flex items-center gap-2 font-medium">
                        <task.icon className="h-4 w-4" />
                        {task.name}
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Delete {task.name}</span>
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the custom task type.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(task.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No custom tasks yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                All your data is stored securely in your browser's local storage.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Your seed inventory, logs, and schedules are saved directly on your device. Clearing your browser data may remove your Seed Studio data permanently.
                </p>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
