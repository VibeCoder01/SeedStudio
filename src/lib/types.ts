// Represents a seed entry in the master database
export interface SeedDatabaseEntry {
  id: string;
  name: string;
  imageId: string;
  notes: string;
  plantingDepth?: string;
  spacing?: string;
  daysToGermination?: number;
  daysToHarvest?: number;
  tags?: string[];
  germinationNotes?: string;
}

// Represents a seed in the user's personal inventory
export interface Seed {
  id: string; // Unique ID for the user's inventory item
  seedDetailsId: string; // Foreign key to the SeedDatabaseEntry
  source: string;
  packetCount: number;
  seedsPerPacket?: number;
  purchaseYear?: number;
  isWishlist?: boolean;
  lowStockThreshold?: number;
  userNotes?: string; // User-specific notes
}

// A combined view of user's seed and master data
export type SeedDetails = Seed & SeedDatabaseEntry;

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
  seedId?: string; // This will link to the User's inventory Seed ID
  quantity?: number; // e.g., number of packets planted or items harvested
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
  seedId: string; // Links to the user's inventory item ID
  sowingDate: string; // ISO string
  germinationDate?: string; // ISO string
  pottingUpDate?: string; // ISO string
  hardeningOffDate?: string; // ISO string
  plantingOutDate?: string; // ISO string
  notes?: string;
  quantityPlanted?: number;
  quantityGerminated?: number;
}
