
'use client';
import { useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Tag, Upload, Download, Sun, Moon } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { DEFAULT_TASK_TYPES, INITIAL_SEEDS } from '@/lib/data';
import type { TaskType, Seed, LogEntry, ScheduledTask } from '@/lib/types';
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
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/hooks/use-theme';

const formSchema = z.object({
  name: z.string().min(2, 'Task name must be at least 2 characters.'),
});

type CustomTaskFormValues = z.infer<typeof formSchema>;

export default function SettingsPage() {
  const [customTasks, setCustomTasks] = useLocalStorage<TaskType[]>('customTasks', []);
  const [seeds, setSeeds] = useLocalStorage<Seed[]>('seeds', INITIAL_SEEDS);
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('logs', []);
  const [scheduledTasks, setScheduledTasks] = useLocalStorage<ScheduledTask[]>('scheduledTasks', []);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  const form = useForm<CustomTaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = useCallback((data: CustomTaskFormValues) => {
    const newTask: TaskType = {
      id: `custom-${crypto.randomUUID()}`,
      name: data.name,
      icon: Tag,
    };
    setCustomTasks(currentTasks => [...currentTasks, newTask]);
    form.reset();
    toast({
      title: 'Custom Task Added',
      description: `"${data.name}" has been added to your tasks.`,
    });
  }, [setCustomTasks, form, toast]);

  const handleDelete = useCallback((id: string) => {
    setCustomTasks(currentTasks => currentTasks.filter((task) => task.id !== id));
    toast({
        title: 'Custom Task Removed',
        description: `The task has been removed.`,
        variant: 'destructive',
    });
  }, [setCustomTasks, toast]);
  
  const handleExport = useCallback(() => {
    const dataToExport = {
      seeds,
      logs,
      scheduledTasks,
      customTasks,
      exportDate: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seed-studio-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: 'Data Exported',
      description: 'Your data has been downloaded successfully.',
    });
  }, [seeds, logs, scheduledTasks, customTasks, toast]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('Invalid file format');
        }
        const importedData = JSON.parse(text);

        if (
          !('seeds' in importedData) ||
          !('logs' in importedData) ||
          !('scheduledTasks' in importedData) ||
          !('customTasks' in importedData)
        ) {
          throw new Error('File is missing required data.');
        }

        setSeeds(importedData.seeds);
        setLogs(importedData.logs);
        setScheduledTasks(importedData.scheduledTasks);
        setCustomTasks(importedData.customTasks);
        
        toast({
          title: 'Import Successful',
          description: 'Your data has been restored. The app will now reload.',
        });

        setTimeout(() => {
          window.location.reload();
        }, 2000);

      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: error.message || 'Could not parse the file.',
        });
      } finally {
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  }, [setSeeds, setLogs, setScheduledTasks, setCustomTasks, toast]);


  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                Customize the look and feel of the application.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                  <Label>Theme</Label>
                   <div className="flex items-center space-x-2 mt-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="mr-2" /> Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => setTheme('dark')}
                    >
                       <Moon className="mr-2" /> Dark
                    </Button>
                  </div>
               </div>
            </CardContent>
        </Card>
        <Card className="lg:col-span-2">
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
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                Export your data to a file or import it to restore a backup.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="text-base font-medium">Local Storage</h3>
                    <p className="text-sm text-muted-foreground">
                        Your seed inventory, logs, and schedules are saved directly on your device. Clearing your browser data may remove your Seed Studio data permanently.
                    </p>
                </div>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <h3 className="text-base font-medium">Export Data</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                            Download all your application data into a single JSON file for backup.
                        </p>
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export to JSON
                        </Button>
                    </div>
                    <div>
                         <h3 className="text-base font-medium">Import Data</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                           Restore your data from a previously exported JSON backup file.
                        </p>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import from JSON
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to import?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will overwrite all current data in the application. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleImportClick}>
                                    Yes, Import Data
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".json"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
