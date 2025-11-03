'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Seed } from '@/lib/types';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';


const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  source: z.string().min(2, { message: 'Source must be at least 2 characters.' }),
  stock: z.coerce.number().int().min(0, { message: 'Stock must be a positive number.' }),
  imageId: z.string().min(1, { message: 'Please select an image.' }),
});

type SeedFormValues = z.infer<typeof formSchema>;

interface SeedDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (seed: Seed) => void;
  seed?: Seed;
}

export function SeedDialog({ isOpen, onOpenChange, onSave, seed }: SeedDialogProps) {
  const { toast } = useToast();
  const form = useForm<SeedFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      source: '',
      stock: 0,
      imageId: '',
    },
  });

  useEffect(() => {
    if (seed) {
      form.reset(seed);
    } else {
      form.reset({
        name: '',
        source: '',
        stock: 0,
        imageId: '',
      });
    }
  }, [seed, form, isOpen]);

  const onSubmit = (data: SeedFormValues) => {
    const newSeed: Seed = {
      id: seed?.id || crypto.randomUUID(),
      ...data,
    };
    onSave(newSeed);
    onOpenChange(false);
    toast({
      title: seed ? 'Seed Updated' : 'Seed Added',
      description: `${data.name} has been saved successfully.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{seed ? 'Edit Seed' : 'Add New Seed'}</DialogTitle>
          <DialogDescription>
            {seed ? 'Update the details for this seed.' : 'Add a new seed to your inventory.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seed Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cherry Tomato" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Garden Center" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Level</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an image" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PlaceHolderImages.map((image) => (
                        <SelectItem key={image.id} value={image.id}>
                          {image.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
