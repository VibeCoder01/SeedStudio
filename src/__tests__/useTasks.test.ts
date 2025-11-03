
import { renderHook } from '@testing-library/react';
import { useTasks } from '@/hooks/use-tasks';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { DEFAULT_TASK_TYPES } from '@/lib/data';
import type { TaskType } from '@/lib/types';
import { Tag } from 'lucide-react';

// Mock the useLocalStorage hook
jest.mock('@/hooks/use-local-storage');
const mockedUseLocalStorage = useLocalStorage as jest.Mock;

describe('useTasks', () => {
  it('should return default tasks when there are no custom tasks', () => {
    // Arrange
    mockedUseLocalStorage.mockReturnValue([[], jest.fn()]);

    // Act
    const { result } = renderHook(() => useTasks());

    // Assert
    expect(result.current.allTasks).toEqual(DEFAULT_TASK_TYPES);
  });

  it('should combine default and custom tasks', () => {
    // Arrange
    const customTasks: TaskType[] = [
      { id: 'custom-1', name: 'Fertilizing', icon: Tag },
    ];
    mockedUseLocalStorage.mockReturnValue([customTasks, jest.fn()]);

    // Act
    const { result } = renderHook(() => useTasks());

    // Assert
    expect(result.current.allTasks.length).toBe(DEFAULT_TASK_TYPES.length + 1);
    expect(result.current.allTasks).toContainEqual(customTasks[0]);
    expect(result.current.allTasks).toContainEqual(DEFAULT_TASK_TYPES[0]);
  });
  
  it('getTaskById should find a default task', () => {
    // Arrange
    mockedUseLocalStorage.mockReturnValue([[], jest.fn()]);
    
    // Act
    const { result } = renderHook(() => useTasks());
    const plantingTask = result.current.getTaskById('planting');

    // Assert
    expect(plantingTask).toBeDefined();
    expect(plantingTask?.name).toBe('Planting');
  });

  it('getTaskById should find a custom task', () => {
    // Arrange
    const customTasks: TaskType[] = [
      { id: 'custom-1', name: 'Fertilizing', icon: Tag },
    ];
    mockedUseLocalStorage.mockReturnValue([customTasks, jest.fn()]);

    // Act
    const { result } = renderHook(() => useTasks());
    const fertilizingTask = result.current.getTaskById('custom-1');

    // Assert
    expect(fertilizingTask).toBeDefined();
    expect(fertilizingTask?.name).toBe('Fertilizing');
  });

  it('getTaskById should return undefined for a non-existent task', () => {
     // Arrange
    mockedUseLocalStorage.mockReturnValue([[], jest.fn()]);

    // Act
    const { result } = renderHook(() => useTasks());
    const nonExistentTask = result.current.getTaskById('non-existent-id');

    // Assert
    expect(nonExistentTask).toBeUndefined();
  });
});
