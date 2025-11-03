'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash2, ArrowUpDown, Search, X } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

type SortKey = keyof Seed | 'stock';

export default function InventoryPage() {
  const [seeds, setSeeds] = useLocalStorage<Seed[]>('seeds', INITIAL_SEEDS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editingSeed, setEditingSeed] = useState<Seed | undefined>(undefined);
  const [viewingSeed, setViewingSeed] = useState<Seed | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
  const [selectedSeeds, setSelectedSeeds] = useState<string[]>([]);
  const { toast } = useToast();

  const handleAdd = useCallback(() => {
    setEditingSeed(undefined);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((seed: Seed) => {
    setEditingSeed(seed);
    setDialogOpen(true);
  }, []);
  
  const handleViewDetails = useCallback((seed: Seed) => {
    setViewingSeed(seed);
    setDetailDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setSeeds(currentSeeds => currentSeeds.filter((seed) => seed.id !== id));
  }, [setSeeds]);

  const handleSave = useCallback((seed: Seed) => {
    if (editingSeed) {
      setSeeds(currentSeeds => currentSeeds.map((s) => (s.id === seed.id ? seed : s)));
    } else {
      setSeeds(currentSeeds => [...currentSeeds, seed]);
    }
  }, [editingSeed, setSeeds]);

  const getImageData = (imageId: string) => {
    return PlaceHolderImages.find((img) => img.id === imageId) || PlaceHolderImages[0];
  };

  const requestSort = useCallback((key: SortKey) => {
    setSortConfig(currentSortConfig => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (currentSortConfig && currentSortConfig.key === key && currentSortConfig.direction === 'ascending') {
        direction = 'descending';
      }
      return { key, direction };
    });
  }, []);
  
  const sortedAndFilteredSeeds = useMemo(() => {
    let sortableItems = [...seeds];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
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
  
  const toggleSeedSelection = (seedId: string) => {
    setSelectedSeeds(prev => 
      prev.includes(seedId) ? prev.filter(id => id !== seedId) : [...prev, seedId]
    );
  };
  
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked) {
      setSelectedSeeds(sortedAndFilteredSeeds.map(s => s.id));
    } else {
      setSelectedSeeds([]);
    }
  };

  const handleDeleteSelected = useCallback(() => {
    setSeeds(currentSeeds => currentSeeds.filter(seed => !selectedSeeds.includes(seed.id)));
    toast({
      title: `${selectedSeeds.length} seed(s) deleted`,
    });
    setSelectedSeeds([]);
  }, [selectedSeeds, setSeeds, toast]);
  
  // Clear selection if the filter/sort changes
  useEffect(() => {
    setSelectedSeeds([]);
  }, [searchTerm, sortConfig]);

  const isBatchMode = selectedSeeds.length > 0;
  const isAllSelected = sortedAndFilteredSeeds.length > 0 && selectedSeeds.length === sortedAndFilteredSeeds.length;

  return (
    <>
      <PageHeader title="Seed Inventory">
        {!isBatchMode && (
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Seed
          </Button>
        )}
      </PageHeader>
      
       <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="relative lg:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search seeds by name or source..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center justify-start sm:justify-end gap-2 lg:col-span-2">
                 <div className="flex items-center space-x-2">
                    <Checkbox
                        id="selectAll"
                        checked={sortedAndFilteredSeeds.length > 0 && isAllSelected}
                        onCheckedChange={handleSelectAll}
                    />
                    <label
                        htmlFor="selectAll"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Select All
                    </label>
                </div>
                <span className="text-sm text-muted-foreground ml-4">Sort by:</span>
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
      
      {isBatchMode && (
         <Card className="mb-6 sticky top-2 z-10 bg-card/95 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-sm font-medium">{selectedSeeds.length} selected</p>
            <div className="flex gap-2">
               <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete {selectedSeeds.length} seed(s) from your inventory. This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
                <Button variant="outline" onClick={() => setSelectedSeeds([])}>
                    <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {sortedAndFilteredSeeds.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedAndFilteredSeeds.map((seed) => {
            const imageData = getImageData(seed.imageId);
            const isSelected = selectedSeeds.includes(seed.id);
            return (
              <Card key={seed.id} className={isSelected ? 'ring-2 ring-primary' : ''}>
                <CardHeader className="p-0">
                  <div className="relative">
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
                    </button>
                    <div className="absolute top-2 right-2">
                       <Checkbox
                          className="h-6 w-6 bg-background/80 hover:bg-background border-border shadow-md data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          checked={isSelected}
                          onCheckedChange={() => toggleSeedSelection(seed.id)}
                          aria-label={`Select ${seed.name}`}
                        />
                    </div>
                     <div className="p-6 pb-0">
                      <CardTitle className="font-headline">{seed.name}</CardTitle>
                      <CardDescription>{seed.source}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p>
                    In Stock: <span className="font-bold">{seed.stock}</span>
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(seed)} disabled={isBatchMode}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" disabled={isBatchMode}>
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
