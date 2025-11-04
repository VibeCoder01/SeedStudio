'use client';
import { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Plus, Edit, Trash2, Search, GalleryHorizontal } from 'lucide-react';
import type { JournalEntry } from '@/lib/types';
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
import { JournalDialog } from '@/components/app/journal/journal-dialog';
import { JournalDetailDialog } from '@/components/app/journal/journal-detail-dialog';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { deleteImage } from '@/lib/idb';
import Image from 'next/image';
import { LogPhoto } from '@/components/app/logs/log-photo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function JournalPage() {
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>('journalEntries', []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | undefined>(undefined);
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleAdd = useCallback(() => {
    setEditingEntry(undefined);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((entry: JournalEntry) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  }, []);

  const handleViewDetails = useCallback((entry: JournalEntry) => {
    setViewingEntry(entry);
    setDetailDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const entryToDelete = entries.find(entry => entry.id === id);
    if (entryToDelete?.photoIds) {
      for (const photoId of entryToDelete.photoIds) {
        await deleteImage(photoId);
      }
    }
    setEntries(currentEntries => currentEntries.filter((entry) => entry.id !== id));
    toast({
      title: 'Journal Entry Deleted',
    });
  }, [entries, setEntries, toast]);

  const handleSave = useCallback((entry: JournalEntry) => {
    setEntries(currentEntries => {
      const existing = currentEntries.find(e => e.id === entry.id);
      if (existing) {
        return currentEntries.map(e => (e.id === entry.id ? entry : e));
      }
      return [entry, ...currentEntries].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }, [setEntries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry =>
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, searchTerm]);

  return (
    <>
      <PageHeader title="Garden Journal">
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </PageHeader>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search journal entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredEntries.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="flex flex-col">
              {entry.photoIds && entry.photoIds.length > 0 && (
                <div className="relative h-48 w-full cursor-pointer" onClick={() => handleViewDetails(entry)}>
                  <LogPhoto photoId={entry.photoIds[0]} />
                   {entry.photoIds.length > 1 && (
                     <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                        <GalleryHorizontal className="h-3 w-3" />
                        <span>{entry.photoIds.length}</span>
                    </div>
                  )}
                </div>
              )}
              <CardHeader className="cursor-pointer" onClick={() => handleViewDetails(entry)}>
                <CardTitle className="font-headline">{entry.title}</CardTitle>
                <CardDescription>{format(new Date(entry.date), 'PPP')}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow cursor-pointer" onClick={() => handleViewDetails(entry)}>
                <p className="text-sm text-muted-foreground line-clamp-3">{entry.content}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="icon" onClick={() => handleEdit(entry)}>
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
                        This action will permanently delete this journal entry.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(entry.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center h-80">
          <h3 className="text-2xl font-bold tracking-tight">No journal entries yet</h3>
          <p className="text-muted-foreground">
            {searchTerm ? `No entries match your search.` : 'Start by writing your first entry.'}
          </p>
          <Button className="mt-4" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> New Entry
          </Button>
        </div>
      )}

      <JournalDialog isOpen={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} entry={editingEntry} />
      <JournalDetailDialog isOpen={detailDialogOpen} onOpenChange={setDetailDialogOpen} entry={viewingEntry} />
    </>
  );
}
