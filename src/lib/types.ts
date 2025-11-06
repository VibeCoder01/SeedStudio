
export interface Seed {
  id: string;
  name: string;
  source: string;
  packetCount: number;
  seedsPerPacket?: number;
  imageId: string;
  notes: string;
  plantingDepth?: string;
  spacing?: string;
  daysToGermination?: number;
  daysToHarvest?: number;
  tags?: string[];
  purchaseYear?: number;
  isWishlist?: boolean;
  lowStockThreshold?: number;
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
  quantity?: number; // e.g., number of seeds planted or items harvested
  weight?: number; // e.g., weight of harvest
  location?: string; // e.g., "Greenhouse", "Plot A"
  substrate?: string; // e.g., "Seed starting mix"
  quantityGerminated?: number; // For tracking planting success
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

export interface JournalEntry {
  id: string;
  title: string;
  date: string; // ISO string
  content: string;
  photoIds?: string[];
}

export interface Planting {
  id: string;
  seedId: string;
  sowingDate: string; // ISO string
  germinationDate?: string; // ISO string
  pottingUpDate?: string; // ISO string
  hardeningOffDate?: string; // ISO string
  plantingOutDate?: string; // ISO string
  notes?: string;
}
