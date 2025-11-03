'use client';
import Image from 'next/image';
import type { Seed, ScheduledTask } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Edit, CalendarPlus } from 'lucide-react';
import { useState, useCallback } from 'react';
import { ScheduleDialog } from '../schedule/schedule-dialog';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTasks } from '@/hooks/use-tasks';

interface SeedDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  seed?: Seed;
  onEdit: (seed: Seed) => void;
}

export function SeedDetailDialog({ isOpen, onOpenChange, seed, onEdit }: SeedDetailDialogProps) {
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [, setScheduledTasks] = useLocalStorage<ScheduledTask[]>('scheduledTasks', []);
  const { allTasks } = useTasks();

  const handleEditClick = useCallback(() => {
    if (!seed) return;
    onOpenChange(false); // Close this dialog
    onEdit(seed); // Open the edit dialog
  }, [onOpenChange, onEdit, seed]);

  const handleScheduleClick = useCallback(() => {
    onOpenChange(false); // Close this dialog
    setScheduleDialogOpen(true);
  }, [onOpenChange]);

  const handleScheduleSave = useCallback((task: ScheduledTask) => {
    const newScheduledTask = { ...task, id: crypto.randomUUID() };
    setScheduledTasks(currentTasks => [...currentTasks, newScheduledTask]);
  }, [setScheduledTasks]);

  if (!seed) {
    return null;
  }
  
  const imageData = PlaceHolderImages.find((img) => img.id === seed.imageId) || PlaceHolderImages[0];
  
  const scheduleTaskTemplate: Partial<ScheduledTask> = {
    notes: `Task for ${seed.name}`,
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="relative h-60 w-full mb-4">
            <Image
              src={imageData.imageUrl}
              alt={seed.name}
              fill
              className="rounded-lg object-cover"
              data-ai-hint={imageData.imageHint}
            />
          </div>
          <DialogTitle className="text-2xl font-headline">{seed.name}</DialogTitle>
          <DialogDescription>From {seed.source}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[50vh] overflow-y-auto pr-4">
            <div className="flex items-center gap-4">
                <div>
                    <h4 className="font-semibold">Stock Level</h4>
                    <p>{seed.stock}</p>
                </div>
            </div>
             <div className="grid grid-cols-3 gap-4">
                <div>
                    <h4 className="font-semibold">Planting Depth</h4>
                    <p>{seed.plantingDepth || 'N/A'}</p>
                </div>
                <div>
                    <h4 className="font-semibold">Germination</h4>
                    <p>{seed.daysToGermination ? `${seed.daysToGermination} days` : 'N/A'}</p>
                </div>
                <div>
                    <h4 className="font-semibold">Harvest</h4>
                    <p>{seed.daysToHarvest ? `${seed.daysToHarvest} days` : 'N/A'}</p>
                </div>
            </div>
            <div>
                <h4 className="font-semibold">Notes</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{seed.notes || 'No notes for this seed.'}</p>
            </div>
        </div>
        <DialogFooter className="justify-between">
            <Button variant="outline" onClick={handleScheduleClick}>
                <CalendarPlus className="mr-2 h-4 w-4" /> Schedule Task
            </Button>
            <Button variant="default" onClick={handleEditClick}>
                <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <ScheduleDialog
        isOpen={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        onSave={handleScheduleSave}
        scheduledTask={scheduleTaskTemplate}
        tasks={allTasks}
    />
    </>
  );
}
