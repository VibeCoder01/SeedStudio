'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { Planting, Seed } from '@/lib/types';
import { cn } from '@/lib/utils';
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

const formSchema = z.object({
  seedId: z.string().min(1, 'Please select a seed.'),
  sowingDate: z.date({ required_error: 'Sowing date is required.' }),
  germinationDate: z.date().optional(),
  pottingUpDate: z.date().optional(),
  hardeningOffDate: z.date().optional(),
  plantingOutDate: z.date().optional(),
  notes: z.string().optional(),
});

type PlantingFormValues = z.infer<typeof formSchema>;

interface PlantingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (planting: Planting) => void;
  planting?: Planting;
  seeds: Seed[];
}

const DatePickerField = ({ name, label, control }: { name: keyof PlantingFormValues, label: string, control: any }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className="flex flex-col">
        <FormLabel>{label}</FormLabel>
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
                {field.value ? format(field.value as Date, 'PPP') : <span>Pick a date</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={field.value as Date}
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
);

export function PlantingDialog({ isOpen, onOpenChange, onSave, planting, seeds }: PlantingDialogProps) {
  const form = useForm<PlantingFormValues>({
    resolver: zodResolver(formSchema),
  });

  const parseOptionalDate = (dateString?: string) => {
    return dateString ? new Date(dateString) : undefined;
  };

  useEffect(() => {
    if (isOpen) {
      form.reset({
        seedId: planting?.seedId || '',
        sowingDate: planting?.sowingDate ? new Date(planting.sowingDate) : new Date(),
        germinationDate: parseOptionalDate(planting?.germinationDate),
        pottingUpDate: parseOptionalDate(planting?.pottingUpDate),
        hardeningOffDate: parseOptionalDate(planting?.hardeningOffDate),
        plantingOutDate: parseOptionalDate(planting?.plantingOutDate),
        notes: planting?.notes || '',
      });
    }
  }, [planting, form, isOpen]);

  const onSubmit = (data: PlantingFormValues) => {
    const newPlanting: Planting = {
      id: planting?.id || crypto.randomUUID(),
      seedId: data.seedId,
      sowingDate: data.sowingDate.toISOString(),
      germinationDate: data.germinationDate?.toISOString(),
      pottingUpDate: data.pottingUpDate?.toISOString(),
      hardeningOffDate: data.hardeningOffDate?.toISOString(),
      plantingOutDate: data.plantingOutDate?.toISOString(),
      notes: data.notes,
    };
    onSave(newPlanting);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{planting ? 'Edit Planting' : 'Add New Planting'}</DialogTitle>
          <DialogDescription>
            Track a batch of seeds from sowing to planting out.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="seedId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seed Variety</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!planting}>
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
            
            <DatePickerField name="sowingDate" label="Sowing Date" control={form.control} />

            <div className="grid grid-cols-2 gap-4">
              <DatePickerField name="germinationDate" label="Germination Date" control={form.control} />
              <DatePickerField name="pottingUpDate" label="Potting Up Date" control={form.control} />
              <DatePickerField name="hardeningOffDate" label="Hardening Off Date" control={form.control} />
              <DatePickerField name="plantingOutDate" label="Planting Out Date" control={form.control} />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any details about this planting..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Save Planting</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
