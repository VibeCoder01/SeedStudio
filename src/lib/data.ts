import type { Seed, SeedDatabaseEntry, TaskType } from './types';
import { Sprout, Droplets, Grape, Scissors, Bug, Shovel } from 'lucide-react';
import seedDb from './seed-database.json';

export const DEFAULT_TASK_TYPES: TaskType[] = [
  { id: 'planting', name: 'Planting', icon: Sprout },
  { id: 'watering', name: 'Watering', icon: Droplets },
  { id: 'harvesting', name: 'Harvesting', icon: Grape },
  { id: 'pruning', name: 'Pruning', icon: Scissors },
  { id: 'pest-control', name: 'Pest Control', icon: Bug },
  { id: 'soil-prep', name: 'Soil Preparation', icon: Shovel },
];

export const SEED_DATABASE: SeedDatabaseEntry[] = seedDb.seeds;

// This is now just the user's personal inventory, referencing the master database
export const INITIAL_SEEDS: Seed[] = [
  {
    id: 'user-tomato-1',
    seedDetailsId: 'db-cherry-tomato',
    source: 'Garden Center',
    packetCount: 5,
    purchaseYear: 2023,
    userNotes: 'These did great in the green pot last year.',
    lowStockThreshold: 2,
  },
  {
    id: 'user-carrot-1',
    seedDetailsId: 'db-nantes-carrot',
    source: 'Online Retailer',
    packetCount: 10,
    purchaseYear: 2024,
  },
  {
    id: 'user-lettuce-1',
    seedDetailsId: 'db-romaine-lettuce',
    source: 'Seed Swap',
    packetCount: 7,
    purchaseYear: 2023,
    isWishlist: true,
  },
    {
    id: 'user-basil-1',
    seedDetailsId: 'db-genovese-basil',
    source: 'Local Farm',
    packetCount: 20,
    purchaseYear: 2024,
  }
];
