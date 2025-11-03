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
import { Textarea } from '@/components/ui/textarea';


const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  source: z.string().min(2, { message: 'Source must be at least 2 characters.' }),
  stock: z.coerce.number().int().min(0, { message: 'Stock must be a positive number.' }),
  imageId: z.string().min(1, { message: 'Please select an image.' }),
  notes: z.string().optional(),
  plantingDepth: z.string().optional(),
  daysToGermination: z.coerce.number().int().min(0).optional(),
  daysToHarvest: z.coerce.number().int().min(0).optional(),
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
      notes: '',
      plantingDepth: '',
      daysToGermination: 0,
      daysToHarvest: 0,
    },
  });

  useEffect(() => {
    if (seed) {
      form.reset({
        ...seed,
        daysToGermination: seed.daysToGermination ?? 0,
        daysToHarvest: seed.daysToHarvest ?? 0,
      });
    } else {
      form.reset({
        name: '',
        source: '',
        stock: 0,
        imageId: '',
        notes: '',
        plantingDepth: '',
        daysToGermination: 0,
        daysToHarvest: 0,
      });
    }
  }, [seed, form, isOpen]);

  const onSubmit = (data: SeedFormValues) => {
    const newSeed: Seed = {
      id: seed?.id || crypto.randomUUID(),
      ...data,
      notes: data.notes || '',
    };
    onSave(newSeed);
    onOpenChange(false);
    
    toast({
      title: seed ? 'Seed Updated' : 'Seed Added',
      description: `${data.name} has been saved successfully.`,
    });
    
    if (seed && seed.stock >= 10 && newSeed.stock < 10) {
       toast({
        title: 'Low Stock Alert',
        description: `${newSeed.name} is running low.`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{seed ? 'Edit Seed' : 'Add New Seed'}</DialogTitle>
          <DialogDescription>
            {seed ? 'Update the details for this seed.' : 'Add a new seed to your inventory.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
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
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="plantingDepth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planting Depth</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1/4 inch" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="daysToGermination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Germination</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 7" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="daysToHarvest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harvest</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 60" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Planting instructions, tips, etc." {...field} />
                  </FormControl>
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
