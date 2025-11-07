'use client';
import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Seed, SeedDetails } from '@/lib/types';
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
import { TagInput } from '@/components/ui/tag-input';
import { GARDENING_TAGS } from '@/lib/tag-data';
import { SEED_DATABASE } from '@/lib/data';


const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  source: z.string().min(2, { message: 'Source must be at least 2 characters.' }),
  packetCount: z.coerce.number().int().min(0, { message: 'Packet count must be a positive number.' }),
  seedsPerPacket: z.union([z.string(), z.number()]).transform(val => val === '' ? undefined : Number(val)).optional(),
  imageId: z.string().min(1, { message: 'Please select an image.' }),
  notes: z.string().optional(),
  plantingDepth: z.string().optional(),
  spacing: z.string().optional(),
  daysToGermination: z.union([z.string(), z.number()]).transform(val => val === '' ? undefined : Number(val)).optional(),
  daysToHarvest: z.union([z.string(), z.number()]).transform(val => val === '' ? undefined : Number(val)).optional(),
  tags: z.array(z.string()).optional(),
  purchaseYear: z.union([z.string(), z.number()]).transform(val => val === '' ? undefined : Number(val)).optional(),
  isWishlist: z.boolean().default(false),
  lowStockThreshold: z.union([z.string(), z.number()]).transform(val => val === '' ? 10 : Number(val)).optional(),
  germinationNotes: z.string().optional(),
  seedDetailsId: z.string().optional(),
});

type SeedFormValues = z.infer<typeof formSchema>;

interface SeedDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (seed: Seed) => void;
  seed?: SeedDetails;
}

export function SeedDialog({ isOpen, onOpenChange, onSave, seed }: SeedDialogProps) {
  const { toast } = useToast();
  const form = useForm<SeedFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      source: '',
      packetCount: 0,
      seedsPerPacket: undefined,
      imageId: '',
      notes: '',
      plantingDepth: '',
      spacing: '',
      daysToGermination: undefined,
      daysToHarvest: undefined,
      tags: [],
      purchaseYear: new Date().getFullYear(),
      isWishlist: false,
      lowStockThreshold: 10,
      germinationNotes: '',
    },
  });

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLInputElement;
      if (target.form) {
        // Find the "Save" button and click it programmatically
        const saveButton = target.form.querySelector<HTMLButtonElement>('button[type="submit"]');
        if (saveButton) {
          e.preventDefault();
          saveButton.click();
        }
      }
    }
  }, []);
  
  const seedDetailsId = form.watch('seedDetailsId');
  useEffect(() => {
    if(seedDetailsId) {
      const dbSeed = SEED_DATABASE.find(s => s.id === seedDetailsId);
      if(dbSeed) {
        form.setValue('name', dbSeed.name);
        form.setValue('imageId', dbSeed.imageId);
        form.setValue('plantingDepth', dbSeed.plantingDepth);
        form.setValue('spacing', dbSeed.spacing);
        form.setValue('daysToGermination', dbSeed.daysToGermination);
        form.setValue('daysToHarvest', dbSeed.daysToHarvest);
        form.setValue('tags', dbSeed.tags);
        form.setValue('germinationNotes', dbSeed.germinationNotes);
      }
    }
  }, [seedDetailsId, form]);

  useEffect(() => {
    if (seed) {
      form.reset({
        ...seed,
        seedsPerPacket: seed.seedsPerPacket ?? undefined,
        daysToGermination: seed.daysToGermination ?? undefined,
        daysToHarvest: seed.daysToHarvest ?? undefined,
        purchaseYear: seed.purchaseYear ?? new Date().getFullYear(),
        tags: seed.tags || [],
        notes: seed.notes || '',
        plantingDepth: seed.plantingDepth || '',
        spacing: seed.spacing || '',
        isWishlist: seed.isWishlist ?? false,
        lowStockThreshold: seed.lowStockThreshold ?? 10,
        germinationNotes: seed.germinationNotes ?? '',
      });
    } else {
      form.reset({
        name: '',
        source: '',
        packetCount: 0,
        seedsPerPacket: undefined,
        imageId: '',
        notes: '',
        plantingDepth: '',
        spacing: '',
        daysToGermination: undefined,
        daysToHarvest: undefined,
        tags: [],
        purchaseYear: new Date().getFullYear(),
        isWishlist: false,
        lowStockThreshold: 10,
        germinationNotes: '',
      });
    }
  }, [seed, form, isOpen]);

  const onSubmit = (data: SeedFormValues) => {
    // We only save the user-specific data to local storage
    const newSeed: Seed = {
      id: seed?.id || crypto.randomUUID(),
      seedDetailsId: data.seedDetailsId || seed?.seedDetailsId || crypto.randomUUID(), // This links to the DB or becomes the ID for a new custom entry
      source: data.source,
      packetCount: data.packetCount,
      purchaseYear: data.purchaseYear,
      isWishlist: data.isWishlist,
      lowStockThreshold: data.lowStockThreshold,
      userNotes: data.notes // We can rename notes to userNotes to distinguish
    };
    
    // Here you would also handle adding a new entry to the SEED_DATABASE if it's a custom seed
    // For this example, we'll assume we are only editing the user-specific part
    
    onSave(newSeed);
    onOpenChange(false);
    
    toast({
      title: seed ? 'Seed Updated' : 'Seed Added',
      description: `${data.name} has been saved successfully.`,
    });
    
    const lowStockThreshold = newSeed.lowStockThreshold ?? 10;
    const oldLowStockThreshold = seed?.lowStockThreshold ?? 10;
    
    if (seed && !seed.isWishlist && seed.packetCount >= oldLowStockThreshold && newSeed.packetCount < lowStockThreshold) {
       toast({
        title: 'Low Stock Alert',
        description: `${data.name} is running low on packets.`,
      });
    }
  };
  
  const isWishlist = form.watch('isWishlist');
  const isEditing = !!seed;

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
             {!isEditing && (
              <FormField
                control={form.control}
                name="seedDetailsId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seed Variety</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a seed from the database" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SEED_DATABASE.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Or fill in the details below to add a custom seed.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
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
                    <Input placeholder="e.g., Cherry Tomato" {...field} disabled={!!seedDetailsId && !isEditing} />
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="packetCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Packets in Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          value={typeof field.value === 'number' ? field.value : ''}
                          onChange={(event) => {
                            const value = event.target.value;
                            field.onChange(value === '' ? 0 : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="seedsPerPacket"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seeds Per Packet</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="e.g., 50"
                          value={field.value ?? ''}
                          onChange={(event) => {
                            const value = event.target.value;
                            field.onChange(value === '' ? undefined : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <FormField
              control={form.control}
              name="imageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value} disabled={!!seedDetailsId && !isEditing}>
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
                        <TagInput
                          tags={field.value || []}
                          suggestions={GARDENING_TAGS}
                          onChange={(tags: string[]) => {
                            field.onChange(tags);
                          }}
                        />
                    </FormControl>
                     <FormDescription>
                      Add tags to help organize your seeds.
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
                        <Input placeholder="e.g., 1/4 inch" {...field} disabled={!!seedDetailsId && !isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="spacing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spacing</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 18 inches" {...field} disabled={!!seedDetailsId && !isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <div className="grid grid-cols-2 gap-4">
               <FormField
                    control={form.control}
                    name="purchaseYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 2024"
                            value={field.value ?? ''}
                            onChange={(event) => {
                              const value = event.target.value;
                              field.onChange(value === '' ? undefined : Number(value));
                            }}
                          />
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
                      <FormLabel>Days to Germination</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 7"
                          value={field.value ?? ''}
                          onChange={(event) => {
                            const value = event.target.value;
                            field.onChange(value === '' ? undefined : Number(value));
                          }}
                           disabled={!!seedDetailsId && !isEditing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="daysToHarvest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days to Harvest</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 60"
                        value={field.value ?? ''}
                        onChange={(event) => {
                          const value = event.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                         disabled={!!seedDetailsId && !isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               {!isWishlist && (
                <FormField
                  control={form.control}
                  name="lowStockThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low Stock Threshold</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="e.g., 10"
                          value={field.value ?? ''}
                          onChange={(event) => {
                            const value = event.target.value;
                            field.onChange(value === '' ? undefined : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}
            </div>
             <FormField
              control={form.control}
              name="germinationNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Germination Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Special germination instructions, e.g., 'Soak overnight', 'Requires cold stratification'." {...field} disabled={!!seedDetailsId && !isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Personal Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Personal notes for this seed, specific to your garden." {...field} />
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
