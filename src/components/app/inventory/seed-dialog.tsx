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
  FormDescription,
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
import { Switch } from '@/components/ui/switch';


const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  source: z.string().min(2, { message: 'Source must be at least 2 characters.' }),
  stock: z.coerce.number().int().min(0, { message: 'Stock must be a positive number.' }),
  imageId: z.string().min(1, { message: 'Please select an image.' }),
  notes: z.string().optional(),
  plantingDepth: z.string().optional(),
  daysToGermination: z.coerce.number().int().min(0).optional(),
  daysToHarvest: z.coerce.number().int().min(0).optional(),
  tags: z.string().optional(),
  purchaseYear: z.coerce.number().optional(),
  isWishlist: z.boolean().default(false),
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
      tags: '',
      purchaseYear: new Date().getFullYear(),
      isWishlist: false,
    },
  });

  useEffect(() => {
    if (seed) {
      form.reset({
        ...seed,
        daysToGermination: seed.daysToGermination ?? undefined,
        daysToHarvest: seed.daysToHarvest ?? undefined,
        purchaseYear: seed.purchaseYear ?? new Date().getFullYear(),
        tags: seed.tags?.join(', ') || '',
        isWishlist: seed.isWishlist ?? false,
      });
    } else {
      form.reset({
        name: '',
        source: '',
        stock: 0,
        imageId: '',
        notes: '',
        plantingDepth: '',
        daysToGermination: undefined,
        daysToHarvest: undefined,
        tags: '',
        purchaseYear: new Date().getFullYear(),
        isWishlist: false,
      });
    }
  }, [seed, form, isOpen]);

  const onSubmit = (data: SeedFormValues) => {
    const newSeed: Seed = {
      id: seed?.id || crypto.randomUUID(),
      ...data,
      notes: data.notes || '',
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
    };
    onSave(newSeed);
    onOpenChange(false);
    
    toast({
      title: seed ? 'Seed Updated' : 'Seed Added',
      description: `${data.name} has been saved successfully.`,
    });
    
    if (seed && !seed.isWishlist && seed.stock >= 10 && newSeed.stock < 10) {
       toast({
        title: 'Low Stock Alert',
        description: `${newSeed.name} is running low.`,
      });
    }
  };
  
  const isWishlist = form.watch('isWishlist');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{seed ? 'Edit Seed' : 'Add New Seed'}</DialogTitle>
          <DialogDescription>
            {seed ? 'Update the details for this seed.' : 'Add a new seed to your inventory or wishlist.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="isWishlist"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Add to Wishlist</FormLabel>
                    <FormDescription>
                      Is this a seed you want to buy, not one you own?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
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
                    <Input placeholder="e.g., Garden Center, Online" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isWishlist && (
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Packets in Stock</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="imageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
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
             <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., heirloom, full-sun, organic" {...field} />
                  </FormControl>
                  <FormDescription>
                    Add comma-separated tags to help organize your seeds.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
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
                    name="purchaseYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Year</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 2024" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="daysToGermination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days to Germination</FormLabel>
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
                    <FormLabel>Days to Harvest</FormLabel>
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
