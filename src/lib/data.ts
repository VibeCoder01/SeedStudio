import type { TaskType, Seed } from './types';
import { Sprout, Droplets, Grape, Scissors, Bug, Shovel } from 'lucide-react';

export const DEFAULT_TASK_TYPES: TaskType[] = [
  { id: 'planting', name: 'Planting', icon: Sprout },
  { id: 'watering', name: 'Watering', icon: Droplets },
  { id: 'harvesting', name: 'Harvesting', icon: Grape },
  { id: 'pruning', name: 'Pruning', icon: Scissors },
  { id: 'pest-control', name: 'Pest Control', icon: Bug },
  { id: 'soil-prep', name: 'Soil Preparation', icon: Shovel },
];

export const INITIAL_SEEDS: Seed[] = [
  {
    id: 'tomato-seeds-1',
    name: 'Cherry Tomato',
    source: 'Garden Center',
    stock: 50,
    imageId: 'tomato-seeds',
    notes: 'Plant in full sun, 24-36 inches apart. Water consistently.',
    plantingDepth: '1/4 inch',
    daysToGermination: 7,
    daysToHarvest: 60,
    tags: ['heirloom', 'full-sun'],
  },
  {
    id: 'carrot-seeds-1',
    name: 'Nantes Carrot',
    source: 'Online Retailer',
    stock: 100,
    imageId: 'carrot-seeds',
    notes: 'Sow seeds thinly in rows, 1/2 inch deep. Prefers loose, sandy soil.',
    plantingDepth: '1/2 inch',
    daysToGermination: 14,
    daysToHarvest: 70,
    tags: ['root-vegetable', 'cool-weather'],
  },
  {
    id: 'lettuce-seeds-1',
    name: 'Romaine Lettuce',
    source: 'Seed Swap',
    stock: 75,
    imageId: 'lettuce-seeds',
    notes: 'A cool-weather crop. Plant in early spring or fall.',
    plantingDepth: '1/8 inch',
    daysToGermination: 8,
    daysToHarvest: 50,
    tags: ['leafy-green', 'cool-weather'],
  },
    {
    id: 'basil-seeds-1',
    name: 'Genovese Basil',
    source: 'Local Farm',
    stock: 200,
    imageId: 'basil-seeds',
    notes: 'Loves heat. Plant after the last frost. Pinch back leaves to encourage bushy growth.',
    plantingDepth: '1/4 inch',
    daysToGermination: 10,
    daysToHarvest: 60,
    tags: ['herb', 'full-sun', 'container-friendly'],
  }
];
