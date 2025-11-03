'use client';

import { useMemo } from 'react';
import { useLocalStorage } from './use-local-storage';
import { DEFAULT_TASK_TYPES } from '@/lib/data';
import type { TaskType } from '@/lib/types';

/**
 * A custom hook to get all available task types, including default and custom ones.
 * @returns An object containing `allTasks` and a `getTaskById` helper function.
 */
export function useTasks() {
  const [customTasks] = useLocalStorage<TaskType[]>('customTasks', []);

  const allTasks = useMemo(() => {
    return [...DEFAULT_TASK_TYPES, ...customTasks];
  }, [customTasks]);

  const getTaskById = (taskId: string): TaskType | undefined => {
    return allTasks.find(task => task.id === taskId);
  };
  
  return { allTasks, getTaskById };
}
