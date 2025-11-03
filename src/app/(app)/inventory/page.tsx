'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash2, ArrowUpDown, Search } from 'lucide-react';
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
import { SeedDetailDialog } from '@/components/app/inventory/seed-detail-dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';

type SortKey = keyof Seed | 'stock';

export default function InventoryPage() {
  const [seeds, setSeeds] = useLocalStorage<Seed[]>('seeds', INITIAL_SEEDS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editingSeed, setEditingSeed] = useState<Seed | undefined>(undefined);
  const [viewingSeed, setViewingSeed] = useState<Seed | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });

  const handleAdd = () => {
    setEditingSeed(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (seed: Seed) => {
    setEditingSeed(seed);
    setDialogOpen(true);
  };
  
  const handleViewDetails = (seed: Seed) => {
    setViewingSeed(seed);
    setDetailDialogOpen(true);
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
    return PlaceHolderImages.find((img) => img.id === imageId) || PlaceHolderImages[0];
  };

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedAndFilteredSeeds = useMemo(() => {
    let sortableItems = [...seeds];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems.filter(seed => 
        seed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seed.source.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [seeds, searchTerm, sortConfig]);

  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  return (
    <>
      <PageHeader title="Seed Inventory">
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Seed
        </Button>
      </PageHeader>
      
       <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search seeds by name or source..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Button variant="outline" size="sm" onClick={() => requestSort('name')}>
                  Name {getSortIndicator('name')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => requestSort('stock')}>
                  Stock {getSortIndicator('stock')}
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {sortedAndFilteredSeeds.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedAndFilteredSeeds.map((seed) => {
            const imageData = getImageData(seed.imageId);
            return (
              <Card key={seed.id}>
                <CardHeader className="p-0">
                  <button className="text-left w-full" onClick={() => handleViewDetails(seed)}>
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
                  </button>
                </CardHeader>
                <CardContent className="p-6">
                  <p>
                    In Stock: <span className="font-bold">{seed.stock}</span>
                  </p>
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
                          This action cannot be undone. This will permanently delete this seed from your
                          inventory.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(seed.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center h-80">
          <h3 className="text-2xl font-bold tracking-tight">No seeds found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? `No seeds match your search for "${searchTerm}".` : "Get started by adding a seed."}
          </p>
          <Button className="mt-4" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Seed
          </Button>
        </div>
      )}

      <SeedDialog isOpen={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} seed={editingSeed} />
      
      <SeedDetailDialog 
        isOpen={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        seed={viewingSeed}
        onEdit={handleEdit}
      />
    </>
  );
}
