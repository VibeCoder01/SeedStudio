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
    const seedNameFromDb = 'Common Rosemary'; 
    const seedOption = screen.getByRole('option', { name: seedNameFromDb, hidden: true });
    
    expect(seedOption).toBeInTheDocument();
    expect(availableSeeds.length).toBe(INITIAL_SEEDS.length); 
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

    const seedNameFromDb = 'Nantes Carrot';
    const seedOption = screen.getByRole('option', { name: seedNameFromDb, hidden: true });

    expect(seedOption).toBeInTheDocument();
    expect(availableSeeds.length).toBe(INITIAL_SEEDS.length);
  });
  
  it('InventoryPage should display seed names from the master database', () => {
    mockedUseLocalStorage.mockImplementation((key: string) => {
      if (key === 'seeds') {
        return [INITIAL_SEEDS, jest.fn()];
      }
      return [[], jest.fn()];
    });

    render(
        <TestWrapper>
            <InventoryPage />
        </TestWrapper>
    );

    const seedNameFromDb = 'Common Rosemary';
    
    // The name is rendered as a CardTitle
    const cardTitle = screen.getByText(seedNameFromDb);
    expect(cardTitle).toBeInTheDocument();

    const allCards = screen.getAllByRole('heading', { level: 2, 'hidden': true}); 
    expect(allCards.length).toBe(INITIAL_SEEDS.length);
  });
});