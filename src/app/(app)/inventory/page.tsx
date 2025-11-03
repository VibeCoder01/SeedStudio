'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { INITIAL_SEEDS } from '@/lib/data';
import type { Seed } from '@/lib/types';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { SeedDialog } from '@/components/app/inventory/seed-dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function InventoryPage() {
  const [seeds, setSeeds] = useLocalStorage<Seed[]>('seeds', INITIAL_SEEDS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSeed, setEditingSeed] = useState<Seed | undefined>(undefined);

  const handleAdd = () => {
    setEditingSeed(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (seed: Seed) => {
    setEditingSeed(seed);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSeeds(seeds.filter((seed) => seed.id !== id));
  };

  const handleSave = (seed: Seed) => {
    if (editingSeed) {
      setSeeds(seeds.map((s) => (s.id === seed.id ? seed : s)));
    } else {
      setSeeds([...seeds, seed]);
    }
  };
  
  const getImageData = (imageId: string) => {
    return PlaceHolderImages.find(img => img.id === imageId) || PlaceHolderImages[0];
  }

  return (
    <>
      <PageHeader title="Seed Inventory">
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Seed
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {seeds.map((seed) => {
          const imageData = getImageData(seed.imageId);
          return (
            <Card key={seed.id}>
              <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                  <Image
                    src={imageData.imageUrl}
                    alt={seed.name}
                    fill
                    className="rounded-t-lg object-cover"
                    data-ai-hint={imageData.imageHint}
                  />
                </div>
                 <div className="p-6 pb-0">
                    <CardTitle className="font-headline">{seed.name}</CardTitle>
                    <CardDescription>{seed.source}</CardDescription>
                 </div>
              </CardHeader>
              <CardContent className="p-6">
                <p>In Stock: <span className="font-bold">{seed.stock}</span></p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="icon" onClick={() => handleEdit(seed)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this seed from your inventory.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(seed.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      <SeedDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        seed={editingSeed}
      />
    </>
  );
}
