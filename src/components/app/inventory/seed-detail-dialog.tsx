'use client';
import Image from 'next/image';
import type { Seed } from '@/lib/types';
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
import { Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SeedDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  seed?: Seed;
  onEdit: (seed: Seed) => void;
}

export function SeedDetailDialog({ isOpen, onOpenChange, seed, onEdit }: SeedDetailDialogProps) {
  if (!seed) return null;

  const imageData = PlaceHolderImages.find((img) => img.id === seed.imageId) || PlaceHolderImages[0];
  
  const handleEditClick = () => {
    onOpenChange(false); // Close this dialog
    onEdit(seed); // Open the edit dialog
  };

  return (
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
        <DialogFooter>
            <Button variant="outline" onClick={handleEditClick}>
                <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
