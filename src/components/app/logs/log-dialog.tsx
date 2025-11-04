'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Upload, X } from 'lucide-react';
import type { LogEntry, TaskType, Seed } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { addImage, getImage, deleteImage } from '@/lib/idb';

const formSchema = z.object({
  taskId: z.string().min(1, 'Please select an activity.'),
  date: z.date({ required_error: 'A date is required.' }),
  notes: z.string().optional(),
  photoId: z.string().optional(),
  seedId: z.string().optional(),
  quantity: z.coerce.number().optional(),
});

type LogFormValues = z.infer<typeof formSchema>;

interface LogDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (log: LogEntry) => void;
  log?: Partial<LogEntry>;
  tasks: TaskType[];
  seeds?: Seed[];
}

export function LogDialog({ isOpen, onOpenChange, onSave, log, tasks, seeds }: LogDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);

  const form = useForm<LogFormValues>({
    resolver: zodResolver(formSchema),
  });

  const taskId = useWatch({ control: form.control, name: 'taskId' });
  const currentPhotoId = useWatch({ control: form.control, name: 'photoId' });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        taskId: log?.taskId || '',
        date: log?.date ? new Date(log.date) : new Date(),
        notes: log?.notes || '',
        photoId: log?.photoId || '',
        seedId: log?.seedId || '',
        quantity: log?.quantity || 0,
      });

      if (log?.photoId) {
        getImage(log.photoId).then(setPhotoPreview);
      } else {
        setPhotoPreview(undefined);
      }
    } else {
      setPhotoPreview(undefined);
    }
  }, [log, form, isOpen]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) { // 4MB limit for IndexedDB
        toast({
            variant: 'destructive',
            title: 'File too large',
            description: 'Please select an image smaller than 4MB.',
        });
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        
        // If there's an old photo, remove it from DB
        if (currentPhotoId) {
          await deleteImage(currentPhotoId);
        }

        const newId = crypto.randomUUID();
        await addImage(newId, dataUrl);
        form.setValue('photoId', newId);
        setPhotoPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    if (currentPhotoId) {
      await deleteImage(currentPhotoId);
    }
    form.setValue('photoId', undefined);
    setPhotoPreview(undefined);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const onSubmit = (data: LogFormValues) => {
    const newLog: LogEntry = {
      id: log?.id || crypto.randomUUID(),
      taskId: data.taskId,
      date: data.date.toISOString(),
      notes: data.notes || '',
      photoId: data.photoId,
      seedId: data.seedId,
      quantity: data.quantity,
    };
    onSave(newLog);
    onOpenChange(false);
    toast({
      title: log?.id ? 'Log Updated' : 'Log Added',
      description: 'Your garden log has been updated.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{log?.id ? 'Edit Log Entry' : 'Add New Log Entry'}</DialogTitle>
          <DialogDescription>
            {log?.id ? 'Update the details for this log.' : 'Add a new activity to your garden log.'}
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            {taskId === 'planting' && seeds && (
              <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="seedId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seed</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a seed" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {seeds.map((seed) => (
                            <SelectItem key={seed.id} value={seed.id}>
                              {seed.name}
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
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
                    <Textarea placeholder="Any details about the activity..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="photoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo</FormLabel>
                  <FormControl>
                    <>
                      <Input 
                        type="file" 
                        className="hidden"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                       <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={!!photoPreview}
                        >
                           <Upload className="mr-2 h-4 w-4" />
                           Upload Photo
                       </Button>
                    </>
                  </FormControl>
                   {photoPreview && (
                    <div className="mt-2 relative w-full h-48">
                      <Image src={photoPreview} alt="Preview" fill className="rounded-md object-cover" />
                       <Button 
                          type="button" 
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={handleRemovePhoto}
                        >
                          <X className="h-4 w-4" />
                       </Button>
                    </div>
                  )}
                  <FormDescription>
                    Optional: Attach a photo to this log entry (max 4MB).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
