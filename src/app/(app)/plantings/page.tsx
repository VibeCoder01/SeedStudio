'use client';

import { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { INITIAL_SEEDS } from '@/lib/data';
import type { Planting, Seed, LogEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Card, CardContent } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { PlantingDialog } from '@/components/app/plantings/planting-dialog';

export default function PlantingsPage() {
  const [plantings, setPlantings] = useLocalStorage<Planting[]>('plantings', []);
  const [seeds] = useLocalStorage<Seed[]>('seeds', INITIAL_SEEDS);
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('logs', []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlanting, setEditingPlanting] = useState<Planting | undefined>(undefined);
  const { toast } = useToast();

  const getSeedById = useCallback((seedId: string) => {
    return seeds.find((seed) => seed.id === seedId);
  }, [seeds]);

  const handleAdd = useCallback(() => {
    setEditingPlanting(undefined);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((planting: Planting) => {
    setEditingPlanting(planting);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setPlantings(current => current.filter(p => p.id !== id));
    toast({ title: 'Planting record deleted' });
  }, [setPlantings, toast]);

  const handleSave = useCallback((planting: Planting) => {
    const isEditing = !!editingPlanting;
    if (isEditing) {
      setPlantings(current => current.map(p => (p.id === planting.id ? planting : p)));
    } else {
      setPlantings(current => [...current, planting]);
      // Also create a corresponding log entry
      const seed = getSeedById(planting.seedId);
      const newLog: LogEntry = {
        id: crypto.randomUUID(),
        taskId: 'planting',
        date: planting.sowingDate,
        seedId: planting.seedId,
        notes: `Sowed ${seed?.name || 'seed'}. ${planting.notes || ''}`.trim(),
      };
      setLogs(current => [newLog, ...current]);
    }
    toast({
      title: isEditing ? 'Planting Updated' : 'Planting Added',
      description: 'Your planting record has been saved.',
    });
  }, [editingPlanting, setPlantings, setLogs, getSeedById, toast]);

  const sortedPlantings = useMemo(() => {
    return [...plantings].sort((a, b) => parseISO(b.sowingDate).getTime() - parseISO(a.sowingDate).getTime());
  }, [plantings]);

  const formatDate = (dateString?: string) => {
    return dateString ? format(parseISO(dateString), 'MMM d, yyyy') : '–';
  };

  return (
    <>
      <PageHeader title="Planting Lifecycle">
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Planting
        </Button>
      </PageHeader>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variety</TableHead>
                <TableHead>Sowing Date</TableHead>
                <TableHead>Germination</TableHead>
                <TableHead>Potting Up</TableHead>
                <TableHead>Hardening Off</TableHead>
                <TableHead>Planting Out</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPlantings.length > 0 ? (
                sortedPlantings.map((planting) => (
                  <TableRow key={planting.id}>
                    <TableCell className="font-medium">{getSeedById(planting.seedId)?.name || 'Unknown Seed'}</TableCell>
                    <TableCell>{formatDate(planting.sowingDate)}</TableCell>
                    <TableCell>{formatDate(planting.germinationDate)}</TableCell>
                    <TableCell>{formatDate(planting.pottingUpDate)}</TableCell>
                    <TableCell>{formatDate(planting.hardeningOffDate)}</TableCell>
                    <TableCell>{formatDate(planting.plantingOutDate)}</TableCell>
                    <TableCell className="max-w-xs truncate">{planting.notes || '–'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(planting)}>
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
                                This will permanently delete this planting record.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(planting.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No plantings recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <PlantingDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        planting={editingPlanting}
        seeds={seeds.filter(s => !s.isWishlist)}
      />
    </>
  );
}
