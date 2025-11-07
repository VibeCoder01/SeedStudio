
import React from 'react';
import { render, screen } from '@testing-library/react';
import { LogDialog } from '@/components/app/logs/log-dialog';
import { PlantingDialog } from '@/components/app/plantings/planting-dialog';
import InventoryPage from '@/app/(app)/inventory/page';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ToastProvider } from '@/components/ui/toast';
import { SEED_DATABASE, INITIAL_SEEDS } from '@/lib/data';
import type { Seed, SeedDetails, TaskType } from '@/lib/types';
import { Sprout } from 'lucide-react';

// Mock necessary hooks and modules
jest.mock('@/hooks/use-local-storage');
const mockedUseLocalStorage = useLocalStorage as jest.Mock;

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// A wrapper to provide context for components that use useToast
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ToastProvider>{children}</ToastProvider>
);

// Helper to merge seed data, mimicking what components should do
const getSeedDetails = (seed: Seed): SeedDetails => {
  const details = SEED_DATABASE.find(s => s.id === seed.seedDetailsId);
  return { ...details!, ...seed };
};
const allSeedDetails = INITIAL_SEEDS.map(getSeedDetails);
const availableSeeds = allSeedDetails.filter(s => !s.isWishlist);

const mockTasks: TaskType[] = [{ id: 'planting', name: 'Planting', icon: Sprout }];

describe('Seed Data Integrity Checks', () => {

  beforeEach(() => {
    // Provide a generic mock for all calls to useLocalStorage
    mockedUseLocalStorage.mockImplementation((key: string) => {
        if (key === 'seeds') {
            return [INITIAL_SEEDS, jest.fn()];
        }
        return [[], jest.fn()];
    });
  });

  it('LogDialog should receive and render full seed names from the database', () => {
    render(
      <TestWrapper>
        <LogDialog
          isOpen={true}
          onOpenChange={jest.fn()}
          onSave={jest.fn()}
          tasks={mockTasks}
          seeds={availableSeeds} 
          log={{ taskId: 'planting' }}
        />
      </TestWrapper>
    );

    // The LogDialog renders its content inside a form within a Dialog
    // We check if an option with the full name exists.
    // Let's check for a seed we know is in the expanded database.
    const seedNameFromDb = 'Lacinato Kale'; 
    const seedOption = screen.getByRole('option', { name: seedNameFromDb, hidden: true });
    
    expect(seedOption).toBeInTheDocument();
    expect(availableSeeds.length).toBeGreaterThan(4); // Ensure we are testing against the full list
  });

  it('PlantingDialog should receive and render full seed names from the database', () => {
    render(
      <TestWrapper>
        <PlantingDialog
          isOpen={true}
          onOpenChange={jest.fn()}
          onSave={jest.fn()}
          seeds={availableSeeds}
        />
      </TestWrapper>
    );

    const seedNameFromDb = 'French Breakfast Radish';
    const seedOption = screen.getByRole('option', { name: seedNameFromDb, hidden: true });

    expect(seedOption).toBeInTheDocument();
    expect(availableSeeds.length).toBeGreaterThan(4);
  });
  
  it('InventoryPage should display seed names from the master database', () => {
    mockedUseLocalStorage.mockImplementation((key: string) => {
      if (key === 'seeds') {
        // Return the initial seeds which require joining
        return [INITIAL_SEEDS, jest.fn()];
      }
      return [[], jest.fn()];
    });

    render(
        <TestWrapper>
            <InventoryPage />
        </TestWrapper>
    );

    // Check for a seed name that exists in the expanded DB
    const seedNameFromDb = 'Common Rosemary';
    
    // The name is rendered as a CardTitle
    const cardTitle = screen.getByText(seedNameFromDb);
    expect(cardTitle).toBeInTheDocument();

    // Also check that we have more than the original 4 seeds rendering
    const allCards = screen.getAllByRole('heading', { level: 2 }); // CardTitle renders as h2-like div
    expect(allCards.length).toBe(INITIAL_SEEDS.length);
  });
});
