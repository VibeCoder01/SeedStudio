import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPage from '@/app/(app)/settings/page';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ToastProvider } from '@/components/ui/toast'; // To prevent context errors from useToast

// Mock the useLocalStorage hook
jest.mock('@/hooks/use-local-storage');
const mockedUseLocalStorage = useLocalStorage as jest.Mock;

// Mock the useTheme hook as it's used in SettingsPage
jest.mock('@/hooks/use-theme', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}));


// Wrapper component to provide necessary context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ToastProvider>{children}</ToastProvider>
);


describe('SettingsPage', () => {
  let customTasks: any[] = [];
  let setCustomTasks = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    customTasks = [];
    setCustomTasks = jest.fn((update) => {
        if(typeof update === 'function') {
            customTasks = update(customTasks);
        } else {
            customTasks = update;
        }
    });

    mockedUseLocalStorage.mockImplementation((key: string) => {
      if (key === 'customTasks') {
        return [customTasks, setCustomTasks];
      }
      return [[], jest.fn()]; // Default mock for other useLocalStorage calls
    });
    
     // Mock toast
    jest.spyOn(require('@/hooks/use-toast'), 'useToast').mockReturnValue({
      toast: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the custom task form', () => {
    render(
        <TestWrapper>
            <SettingsPage />
        </TestWrapper>
    );
    expect(screen.getByPlaceholderText('e.g., Fertilizing')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add/i })).toBeInTheDocument();
  });

  it('allows a user to add a new custom task', async () => {
    render(
        <TestWrapper>
            <SettingsPage />
        </TestWrapper>
    );

    const input = screen.getByPlaceholderText('e.g., Fertilizing');
    const addButton = screen.getByRole('button', { name: /Add/i });

    // Simulate user input
    fireEvent.change(input, { target: { value: 'New Test Task' } });
    fireEvent.click(addButton);

    // Wait for the state update and re-render
    await waitFor(() => {
      // Check if the setCustomTasks function was called correctly
      expect(setCustomTasks).toHaveBeenCalledTimes(1);
    });
    
    // We can't directly check the UI for the new task because the state is managed
    // by our mock. Instead, we verify the mock was called with the right logic.
    // The mock implementation of setCustomTasks will update our local `customTasks` array.
    expect(customTasks.length).toBe(1);
    expect(customTasks[0].name).toBe('New Test Task');
  });

  it('shows an error message for invalid input', async () => {
    render(
        <TestWrapper>
            <SettingsPage />
        </TestWrapper>
    );
    
    const input = screen.getByPlaceholderText('e.g., Fertilizing');
    const addButton = screen.getByRole('button', { name: /Add/i });

    // Input is too short
    fireEvent.change(input, { target: { value: 'A' } });
    fireEvent.click(addButton);

    // Wait for validation message to appear
    const errorMessage = await screen.findByText('Task name must be at least 2 characters.');
    expect(errorMessage).toBeInTheDocument();
    
    // Verify that the task was not added
    expect(setCustomTasks).not.toHaveBeenCalled();
  });
});
