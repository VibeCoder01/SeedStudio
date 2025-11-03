'use client';

import { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, ArrowUpDown } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { DEFAULT_TASK_TYPES } from '@/lib/data';
import type { LogEntry, TaskType } from '@/lib/types';
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

type SortKey = 'task' | 'date';

export default function LogsPage() {
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('logs', []);
  const [customTasks] = useLocalStorage<TaskType[]>('customTasks', []);
  const allTasks = [...DEFAULT_TASK_TYPES, ...customTasks];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<LogEntry | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });

  const { toast } = useToast();

  const getTaskById = (taskId: string) => {
    return allTasks.find((task) => task.id === taskId);
  };

  const handleAdd = () => {
    setEditingLog(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (log: LogEntry) => {
    setEditingLog(log);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setLogs(logs.filter((log) => log.id !== id));
    toast({
      title: 'Log Deleted',
      description: 'The log entry has been removed.',
    });
  };

  const handleSave = (log: LogEntry) => {
    if (editingLog) {
      setLogs(logs.map((l) => (l.id === log.id ? log : l)));
    } else {
      setLogs([...logs, log]);
    }
  };

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
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
           if (new Date(a.date) < new Date(b.date)) return sortConfig.direction === 'ascending' ? -1 : 1;
           if (new Date(a.date) > new Date(b.date)) return sortConfig.direction === 'ascending' ? 1 : -1;
           return 0;
        }
      });
    }
    return sortableItems.filter(log => {
      const task = getTaskById(log.taskId);
      return (task?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              log.notes?.toLowerCase().includes(searchTerm.toLowerCase()))
    });
  }, [logs, searchTerm, sortConfig]);

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
                  placeholder="Search logs by activity or notes..."
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
                      <TableCell className="max-w-sm truncate">{log.notes || '–'}</TableCell>
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
                  <TableCell colSpan={4} className="h-24 text-center">
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
      />
    </>
  );
}
