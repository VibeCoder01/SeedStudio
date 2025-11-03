
'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash2, Search, ArrowUpDown, ImageIcon } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { INITIAL_SEEDS } from '@/lib/data';
import type { LogEntry, Seed } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
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
import { LogDialog } from '@/components/app/logs/log-dialog';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteImage } from '@/lib/idb';
import { LogPhoto } from '@/components/app/logs/log-photo';
import { useTasks } from '@/hooks/use-tasks';

type SortKey = 'task' | 'date';

export default function LogsPage() {
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('logs', []);
  const [seeds, setSeeds] = useLocalStorage<Seed[]>('seeds', INITIAL_SEEDS);
  const { allTasks, getTaskById } = useTasks();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [viewingPhotoId, setViewingPhotoId] = useState<string | undefined>(undefined);
  const [editingLog, setEditingLog] = useState<LogEntry | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });

  const { toast } = useToast();
  
  const getSeedById = useCallback((seedId?: string) => {
    if (!seedId) return undefined;
    return seeds.find((seed) => seed.id === seedId);
  }, [seeds]);

  const handleAdd = useCallback(() => {
    setEditingLog(undefined);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((log: LogEntry) => {
    setEditingLog(log);
    setDialogOpen(true);
  }, []);
  
  const handleViewPhoto = useCallback((photoId: string) => {
    setViewingPhotoId(photoId);
    setPhotoDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const logToDelete = logs.find(log => log.id === id);
    if (logToDelete?.photoId) {
      await deleteImage(logToDelete.photoId);
    }
    setLogs(currentLogs => currentLogs.filter((log) => log.id !== id));
    toast({
      title: 'Log Deleted',
      description: 'The log entry has been removed.',
    });
  }, [logs, setLogs, toast]);

  const handleSave = useCallback((log: LogEntry) => {
    if (editingLog) {
      setLogs(currentLogs => currentLogs.map((l) => (l.id === log.id ? log : l)));
    } else {
      setLogs(currentLogs => [log, ...currentLogs]); // Add new log to the top
    }

    if (log.taskId === 'planting' && log.seedId && log.quantity) {
      const plantedSeed = getSeedById(log.seedId);
      if (plantedSeed) {
        const newStock = plantedSeed.stock - log.quantity;
        setSeeds(currentSeeds => currentSeeds.map(s => s.id === log.seedId ? {...s, stock: newStock} : s));
        
        if (newStock < 10 && plantedSeed.stock >= 10) {
           toast({
            title: 'Low Stock Alert',
            description: `${plantedSeed.name} is running low.`,
          });
        }
      }
    }
  }, [editingLog, setLogs, getSeedById, setSeeds, toast]);

  const requestSort = useCallback((key: SortKey) => {
    setSortConfig(currentSortConfig => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (currentSortConfig && currentSortConfig.key === key && currentSortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        return { key, direction };
    });
  }, []);
  
  const sortedAndFilteredLogs = useMemo(() => {
    let sortableItems = [...logs];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (sortConfig.key === 'task') {
          const taskA = getTaskById(a.taskId)?.name || '';
          const taskB = getTaskById(b.taskId)?.name || '';
          if (taskA < taskB) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (taskA > taskB) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        } else { // date
           if (new Date(a.date) < new Date(b.date)) return sortConfig.direction === 'ascending' ? 1 : -1;
           if (new Date(a.date) > new Date(b.date)) return sortConfig.direction === 'ascending' ? -1 : 1;
           return 0;
        }
      });
    } else {
       // Default sort by date descending
       sortableItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return sortableItems.filter(log => {
      const task = getTaskById(log.taskId);
      const seed = getSeedById(log.seedId);
      const searchTermLower = searchTerm.toLowerCase();
      return (task?.name.toLowerCase().includes(searchTermLower) ||
              log.notes?.toLowerCase().includes(searchTermLower) ||
              seed?.name.toLowerCase().includes(searchTermLower))
    });
  }, [logs, searchTerm, sortConfig, getTaskById, getSeedById]);

  return (
    <>
      <PageHeader title="Garden Logs">
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Log
        </Button>
      </PageHeader>
      <Card>
        <CardContent className="p-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs by activity, notes, or seed..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
        </CardContent>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('task')}>
                    Activity <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('date')}>
                    Date <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Photo</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredLogs.length > 0 ? (
                sortedAndFilteredLogs.map((log) => {
                  const task = getTaskById(log.taskId);
                  const Icon = task?.icon;
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                          {task?.name || 'Unknown Task'}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(log.date), 'PPP')}</TableCell>
                      <TableCell className="max-w-xs truncate">{log.notes || '–'}</TableCell>
                      <TableCell>
                        {log.photoId ? (
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleViewPhoto(log.photoId!)}>
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        ) : '–'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(log)}>
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
                                  This action cannot be undone. This will permanently delete this log entry.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(log.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {searchTerm ? `No logs match your search for "${searchTerm}".` : 'No logs yet. Start by adding a new log entry.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <LogDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        log={editingLog}
        tasks={allTasks}
        seeds={seeds}
      />
      
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Log Photo</DialogTitle>
          </DialogHeader>
          {viewingPhotoId && <LogPhoto photoId={viewingPhotoId} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
