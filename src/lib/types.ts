export interface Seed {
  id: string;
  name: string;
  source: string;
  stock: number;
  imageId: string;
  notes: string;
}

export interface TaskType {
  id:string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface LogEntry {
  id: string;
  taskId: string;
  date: string; // ISO string
  notes: string;
}

export type Recurrence = 'daily' | 'weekly' | 'bi-weekly' | 'monthly';

export const recurrences: Recurrence[] = ['daily', 'weekly', 'bi-weekly', 'monthly'];

export interface ScheduledTask {
  id: string;
  taskId: string;
  recurrence: Recurrence;
  notes: string;
}
