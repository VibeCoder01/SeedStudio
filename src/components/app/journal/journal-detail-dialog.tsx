'use client';
import Image from 'next/image';
import { JournalEntry } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { LogPhoto } from '../logs/log-photo';
import { format } from 'date-fns';

interface JournalDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: JournalEntry;
}

export function JournalDetailDialog({ isOpen, onOpenChange, entry }: JournalDetailDialogProps) {
  if (!entry) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">{entry.title}</DialogTitle>
          <DialogDescription>{format(new Date(entry.date), 'PPP')}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
            {entry.photoIds && entry.photoIds.length > 0 && (
              <Carousel className="w-full">
                <CarouselContent>
                  {entry.photoIds.map((photoId) => (
                    <CarouselItem key={photoId}>
                      <div className="relative h-80 w-full">
                        <LogPhoto photoId={photoId} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            )}
            <div>
                <p className="text-muted-foreground whitespace-pre-wrap">{entry.content}</p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
