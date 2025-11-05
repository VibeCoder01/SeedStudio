
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
import { Edit, CalendarPlus, History } from 'lucide-react';
import { useState, useCallback } from 'react';
import { ScheduleDialog } from '../schedule/schedule-dialog';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTasks } from '@/hooks/use-tasks';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
  const { toast } = useToast();

  const handleEditClick = useCallback(() => {
    if (!seed) return;
    onOpenChange(false); // Close this dialog
    onEdit(seed); // Open the edit dialog
  }, [onOpenChange, onEdit, seed]);

  const handleScheduleClick = useCallback(() => {
    setScheduleDialogOpen(true);
  }, []);

  const handleScheduleSave = useCallback((task: ScheduledTask) => {
    setScheduledTasks(currentTasks => [...currentTasks, task]);
    toast({
      title: 'Task Scheduled',
      description: 'Your new task has been added to the schedule.',
    });
  }, [setScheduledTasks, toast]);

  if (!seed) {
    return null;
  }
  
  const imageData = PlaceHolderImages.find((img) => img.id === seed.imageId) || PlaceHolderImages[0];
  
  const scheduleTaskTemplate: Partial<ScheduledTask> = {
    notes: `Task for ${seed.name}`,
  };

  const currentYear = new Date().getFullYear();
  const isOldSeed = seed.purchaseYear && currentYear - seed.purchaseYear > 3;

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
             {isOldSeed && (
              <Badge variant="destructive" className="absolute top-2 left-2 flex items-center gap-1">
                <History className="h-3 w-3" />
                Old Seed
              </Badge>
            )}
          </div>
          <DialogTitle className="text-2xl font-headline">{seed.name}</DialogTitle>
          <DialogDescription>From {seed.source}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[50vh] overflow-y-auto pr-4">
            {seed.tags && seed.tags.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {seed.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="font-semibold">Packets in Stock</h4>
                    <p>{seed.isWishlist ? 'Wishlist Item' : seed.packetCount}</p>
                </div>
                 <div>
                    <h4 className="font-semibold">Seeds Per Packet</h4>
                    <p>{seed.seedsPerPacket || 'N/A'}</p>
                </div>
                 <div>
                    <h4 className="font-semibold">Low Stock At</h4>
                    <p>{seed.lowStockThreshold ?? 10} packets</p>
                </div>
            </div>
             <div className="grid grid-cols-3 gap-4">
                 <div>
                    <h4 className="font-semibold">Purchase Year</h4>
                    <p>{seed.purchaseYear || 'N/A'}</p>
                </div>
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
            {!seed.isWishlist && (
              <Button variant="outline" onClick={handleScheduleClick}>
                  <CalendarPlus className="mr-2 h-4 w-4" /> Schedule Task
              </Button>
            )}
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
