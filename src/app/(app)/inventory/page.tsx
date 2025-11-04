'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash2, Search, X, Filter, History } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { INITIAL_SEEDS } from '@/lib/data';
import type { Seed } from '@/lib/types';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Command, CommandGroup, CommandItem } from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';
import { SeedDialog } from '@/components/app/inventory/seed-dialog';
import { SeedDetailDialog } from '@/components/app/inventory/seed-detail-dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type SortKey = 'name' | 'packetCount';

export default function InventoryPage() {
  const [seeds, setSeeds] = useLocalStorage<Seed[]>('seeds', INITIAL_SEEDS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editingSeed, setEditingSeed] = useState<Seed | undefined>(undefined);
  const [viewingSeed, setViewingSeed] = useState<Seed | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
  const [selectedSeeds, setSelectedSeeds] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('stock');
  const { toast } = useToast();

  const ensureSeedArray = useCallback(
    (value: unknown): Seed[] => {
      if (!Array.isArray(value)) {
        return [];
      }

      return value.filter((seed): seed is Seed => {
        if (!seed || typeof seed !== 'object') {
          return false;
        }

        const candidate = seed as Partial<Seed>;
        return typeof candidate.id === 'string' && typeof candidate.name === 'string';
      });
    },
    []
  );

  const normalizedSeeds = useMemo(() => ensureSeedArray(seeds), [seeds, ensureSeedArray]);

  useEffect(() => {
    const rawSeeds = seeds as unknown;

    if (!Array.isArray(rawSeeds)) {
      setSeeds([...INITIAL_SEEDS]);
      toast({
        title: 'Inventory Reset',
        description: 'Stored inventory data was invalid and has been reset.',
      });
      return;
    }

    if (normalizedSeeds.length !== rawSeeds.length) {
      setSeeds(normalizedSeeds);
      toast({
        title: 'Inventory Updated',
        description: 'Invalid items have been removed from your inventory.',
      });
      return;
    }

    const hasNegativeStock = normalizedSeeds.some(seed => Number(seed.packetCount) < 0);

    if (hasNegativeStock) {
      setSeeds(currentSeeds =>
        ensureSeedArray(currentSeeds).map(seed =>
          Number(seed.packetCount) < 0 ? { ...seed, packetCount: 0 } : seed
        )
      );
      toast({
        title: 'Inventory Corrected',
        description: 'Any items with negative stock have been set to 0.',
      });
    }
  }, [seeds, normalizedSeeds, setSeeds, toast, ensureSeedArray]);

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
    setSeeds(currentSeeds =>
      ensureSeedArray(currentSeeds).filter(seed => seed.id !== id)
    );
  }, [setSeeds, ensureSeedArray]);

  const handleSave = useCallback((seed: Seed) => {
    setSeeds(currentSeeds => {
      const seedsArray = ensureSeedArray(currentSeeds);
      if (editingSeed) {
        return seedsArray.map((s) => (s.id === seed.id ? seed : s));
      }
      return [...seedsArray, seed];
    });
  }, [editingSeed, setSeeds, ensureSeedArray]);

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

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    normalizedSeeds.forEach(seed => {
      seed.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [normalizedSeeds]);

  const sortedAndFilteredSeeds = useMemo(() => {
    const isWishlist = activeTab === 'wishlist';
    let sortableItems = normalizedSeeds.filter(seed => (seed.isWishlist || false) === isWishlist);

    if (sortConfig !== null) {
      sortableItems = [...sortableItems].sort((a, b) => {
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

    return sortableItems.filter(seed => {
      const matchesSearch =
        seed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seed.source.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTags =
        selectedTags.length === 0 || selectedTags.every(tag => seed.tags?.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [normalizedSeeds, searchTerm, sortConfig, selectedTags, activeTab]);

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
    setSeeds(currentSeeds =>
      ensureSeedArray(currentSeeds).filter(seed => !selectedSeeds.includes(seed.id))
    );
    toast({
      title: `${selectedSeeds.length} item(s) deleted`,
    });
    setSelectedSeeds([]);
  }, [selectedSeeds, setSeeds, toast, ensureSeedArray]);

  const toggleTagSelection = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  
  // Clear selection if the filter/sort/tab changes
  useEffect(() => {
    setSelectedSeeds([]);
  }, [searchTerm, sortConfig, selectedTags, activeTab]);

  const isBatchMode = selectedSeeds.length > 0;
  const isAllSelected = sortedAndFilteredSeeds.length > 0 && selectedSeeds.length === sortedAndFilteredSeeds.length;
  const currentYear = new Date().getFullYear();

  return (
    <>
      <PageHeader title="Seed Inventory">
        {!isBatchMode && (
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        )}
      </PageHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="stock">In Stock</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        </TabsList>
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="relative lg:col-span-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or source..."
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Tags
                        {selectedTags.length > 0 && <Badge variant="secondary" className="ml-2 rounded-sm">{selectedTags.length}</Badge>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Command>
                        <CommandGroup>
                          {allTags.map((tag) => (
                            <CommandItem key={tag} onSelect={() => toggleTagSelection(tag)}>
                              <Checkbox
                                className="mr-2"
                                checked={selectedTags.includes(tag)}
                              />
                              {tag}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        {selectedTags.length > 0 && (
                          <>
                            <Separator />
                            <CommandGroup>
                              <CommandItem onSelect={() => setSelectedTags([])} className="justify-center text-center">
                                Clear filters
                              </CommandItem>
                            </CommandGroup>
                          </>
                        )}
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <span className="text-sm text-muted-foreground ml-2">Sort by:</span>
                  <Button variant="outline" size="sm" onClick={() => requestSort('name')}>
                    Name {getSortIndicator('name')}
                  </Button>
                  {activeTab === 'stock' && (
                    <Button variant="outline" size="sm" onClick={() => requestSort('packetCount')}>
                      Packets {getSortIndicator('packetCount')}
                    </Button>
                  )}
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
                          This will permanently delete {selectedSeeds.length} item(s). This action cannot be undone.
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

        <TabsContent value={activeTab}>
        {sortedAndFilteredSeeds.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedAndFilteredSeeds.map((seed) => {
              const imageData = getImageData(seed.imageId);
              const isSelected = selectedSeeds.includes(seed.id);
              const isOldSeed = seed.purchaseYear && currentYear - seed.purchaseYear > 3;
              const packetCount = Number(seed.packetCount) > 0 ? Number(seed.packetCount) : 0;
              const seedsPerPacket = Number(seed.seedsPerPacket) > 0 ? Number(seed.seedsPerPacket) : 0;
              const totalSeeds = packetCount * seedsPerPacket;
              const isLowStock = !seed.isWishlist && seed.packetCount < 10;

              return (
                <Card key={seed.id} className={cn(
                    isSelected && 'ring-2 ring-primary',
                    isLowStock && 'border-4 border-yellow-500'
                )}>
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
                         {isOldSeed && (
                            <Badge variant="destructive" className="absolute top-2 left-2 flex items-center gap-1">
                                <History className="h-3 w-3" /> Old Seed
                            </Badge>
                         )}
                      </button>
                      <div className="absolute top-2 right-2">
                         <Checkbox
                            className="h-6 w-6 bg-background/80 hover:bg-background border-border shadow-md data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            checked={isSelected}
                            onCheckedChange={() => toggleSeedSelection(seed.id)}
                            aria-label={`Select ${seed.name}`}
                          />
                      </div>
                       <div className="p-6 pb-2">
                        <CardTitle className="font-headline">{seed.name}</CardTitle>
                        <CardDescription>{seed.source}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-2">
                    {!seed.isWishlist && (
                        <div className="text-sm">
                            <p>
                                Packets: <span className="font-bold">{seed.packetCount}</span>
                            </p>
                            {seed.seedsPerPacket && (
                                <p className="text-muted-foreground">
                                    ~{totalSeeds.toLocaleString()} seeds total
                                </p>
                            )}
                        </div>
                    )}
                    {seed.tags && seed.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {seed.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}
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
                            This action cannot be undone. This will permanently delete this item.
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
            <h3 className="text-2xl font-bold tracking-tight">No items found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? `No items match your search for "${searchTerm}".` : `Get started by adding an item to your ${activeTab}.`}
            </p>
            <Button className="mt-4" onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
        )}
        </TabsContent>
      </Tabs>

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

    