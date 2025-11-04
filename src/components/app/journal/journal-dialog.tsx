'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Upload, X } from 'lucide-react';
import type { JournalEntry } from '@/lib/types';
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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { addImage, getImage, deleteImage } from '@/lib/idb';

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  date: z.date({ required_error: 'A date is required.' }),
  content: z.string().min(1, 'Content is required.'),
  photoIds: z.array(z.string()).optional(),
});

type JournalFormValues = z.infer<typeof formSchema>;

interface JournalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (entry: JournalEntry) => void;
  entry?: JournalEntry;
}

interface PhotoPreview {
  id: string;
  url: string;
}

export function JournalDialog({ isOpen, onOpenChange, onSave, entry }: JournalDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreview[]>([]);

  const form = useForm<JournalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        photoIds: []
    }
  });

  const photoIds = useWatch({ control: form.control, name: 'photoIds', defaultValue: [] });

  useEffect(() => {
    const loadPreviews = async () => {
      if (entry?.photoIds && entry.photoIds.length > 0) {
        const previews: PhotoPreview[] = [];
        for (const id of entry.photoIds) {
          const url = await getImage(id);
          if (url) {
            previews.push({ id, url });
          }
        }
        setPhotoPreviews(previews);
      } else {
        setPhotoPreviews([]);
      }
    };
    
    if (isOpen) {
      form.reset({
        title: entry?.title || '',
        date: entry?.date ? new Date(entry.date) : new Date(),
        content: entry?.content || '',
        photoIds: entry?.photoIds || [],
      });
      loadPreviews();
    } else {
      setPhotoPreviews([]);
    }
  }, [entry, form, isOpen]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
          toast({
              variant: 'destructive',
              title: 'File too large',
              description: `${file.name} is larger than 4MB.`,
          });
          continue;
      }
      
      const reader = new FileReader();
      reader.onload = async (e) => {
          const dataUrl = e.target?.result as string;
          const newId = crypto.randomUUID();
          await addImage(newId, dataUrl);
          
          form.setValue('photoIds', [...(photoIds || []), newId]);
          setPhotoPreviews(prev => [...prev, {id: newId, url: dataUrl}]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = async (idToRemove: string) => {
    await deleteImage(idToRemove);
    form.setValue('photoIds', photoIds?.filter(id => id !== idToRemove));
    setPhotoPreviews(previews => previews.filter(p => p.id !== idToRemove));
  };

  const onSubmit = (data: JournalFormValues) => {
    const newEntry: JournalEntry = {
      id: entry?.id || crypto.randomUUID(),
      title: data.title,
      date: data.date.toISOString(),
      content: data.content,
      photoIds: data.photoIds,
    };
    onSave(newEntry);
    onOpenChange(false);
    toast({
      title: entry?.id ? 'Entry Updated' : 'Entry Added',
      description: 'Your journal has been updated.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{entry?.id ? 'Edit Journal Entry' : 'New Journal Entry'}</DialogTitle>
          <DialogDescription>
            {entry?.id ? 'Update the details for this entry.' : 'Add a new entry to your garden journal.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
             <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Spring Planting Day" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="Write about your garden..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="photoIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photos</FormLabel>
                   <div className="grid grid-cols-3 gap-2">
                    {photoPreviews.map((photo) => (
                       <div key={photo.id} className="relative w-full h-24">
                         <Image src={photo.url} alt="Preview" fill className="rounded-md object-cover" />
                          <Button 
                             type="button" 
                             variant="destructive"
                             size="icon"
                             className="absolute top-1 right-1 h-6 w-6"
                             onClick={() => handleRemovePhoto(photo.id)}
                           >
                             <X className="h-4 w-4" />
                          </Button>
                       </div>
                    ))}
                    </div>
                  <FormControl>
                    <div>
                      <Input 
                        type="file" 
                        className="hidden"
                        ref={fileInputRef}
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                      />
                       <Button 
                          type="button" 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                           <Upload className="mr-2 h-4 w-4" />
                           Add Photos
                       </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    You can add multiple photos to an entry (max 4MB each).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save Entry</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
