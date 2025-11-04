
export interface Seed {
  id: string;
  name: string;
  source: string;
  stock: number;
  imageId: string;
  notes: string;
  plantingDepth?: string;
  daysToGermination?: number;
  daysToHarvest?: number;
  tags?: string[];
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
  photoId?: string; // ID referencing an image in IndexedDB
  seedId?: string;
  quantity?: number;
}

export type Recurrence = 'daily' | 'weekly' | 'bi-weekly' | 'monthly';

export const recurrences = ['daily', 'weekly', 'bi-weekly', 'monthly'] as const;

export interface ScheduledTask {
  id: string;
  taskId: string;
  recurrence: Recurrence;
  notes: string;
  startDate?: string; // ISO string
}
