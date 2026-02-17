import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { queueSyncJob } from '../api/sync-queue';
import { useAppStore } from '@/src/stores/app-store';
import { saveLocalTask, getLocalTasks } from '../db/indexeddb';
import type { Task } from '@/src/types';

/**
 * Hook to fetch tasks for current farm
 */
export function useTasks(status?: string) {
  const currentFarmId = useAppStore((state) => state.currentFarmId);
  const isOnline = useAppStore((state) => state.isOnline);

  return useQuery({
    queryKey: ['tasks', currentFarmId, status],
    queryFn: async () => {
      if (!currentFarmId) {
        throw new Error('No farm selected');
      }

      // Try to fetch from server if online
      if (isOnline) {
        try {
          return await apiClient.get<Task[]>('/tasks', {
            params: { farmId: currentFarmId, status: status || 'all' },
          });
        } catch (error) {
          console.warn('Failed to fetch tasks from server, using local data:', error);
        }
      }

      // Fallback to local data
      return await getLocalTasks(currentFarmId, status);
    },
    enabled: !!currentFarmId,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
}

/**
 * Hook to fetch a single task
 */
export function useTask(taskId: string | null) {
  const currentFarmId = useAppStore((state) => state.currentFarmId);

  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      if (!taskId) throw new Error('No task ID provided');
      return await apiClient.get<Task>(`/tasks/${taskId}`);
    },
    enabled: !!taskId && !!currentFarmId,
  });
}

/**
 * Hook to create a task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  const currentFarmId = useAppStore((state) => state.currentFarmId);
  const isOnline = useAppStore((state) => state.isOnline);

  return useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      if (!currentFarmId) {
        throw new Error('No farm selected');
      }

      const newTask: Task = {
        id: `task_${Date.now()}`,
        farmId: currentFarmId,
        status: 'pending',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...taskData,
      } as Task;

      // Save locally first
      await saveLocalTask({
        ...newTask,
        syncStatus: isOnline ? 'pending' : 'local',
      });

      // Queue for sync if online
      if (isOnline) {
        await queueSyncJob(currentFarmId, 'create-task', {
          method: 'POST',
          endpoint: '/api/tasks',
          body: newTask,
        });
      }

      return newTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * Hook to update a task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  const currentFarmId = useAppStore((state) => state.currentFarmId);
  const isOnline = useAppStore((state) => state.isOnline);

  return useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      if (!currentFarmId) {
        throw new Error('No farm selected');
      }

      // Update locally first
      const existingTask = await apiClient.get<Task>(`/tasks/${taskId}`).catch(() => null);
      
      const updatedTask: Task = {
        ...existingTask,
        ...updates,
        updatedAt: new Date().toISOString(),
      } as Task;

      await saveLocalTask({
        ...updatedTask,
        syncStatus: isOnline ? 'pending' : 'local',
      });

      // Queue for sync if online
      if (isOnline) {
        await queueSyncJob(currentFarmId, 'update-task', {
          method: 'PATCH',
          endpoint: `/api/tasks/${taskId}`,
          body: updates,
        });
      }

      return updatedTask;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
}

/**
 * Hook to complete a task with proof of work
 */
export function useCompleteTask() {
  const queryClient = useQueryClient();
  const currentFarmId = useAppStore((state) => state.currentFarmId);
  const isOnline = useAppStore((state) => state.isOnline);

  return useMutation({
    mutationFn: async ({
      taskId,
      proofOfWork,
    }: {
      taskId: string;
      proofOfWork: Task['proofOfWork'];
    }) => {
      if (!currentFarmId) {
        throw new Error('No farm selected');
      }

      const updates: Partial<Task> = {
        status: 'completed',
        proofOfWork,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save locally
      const existingTask = await apiClient.get<Task>(`/tasks/${taskId}`).catch(() => null);
      const updatedTask: Task = {
        ...existingTask,
        ...updates,
      } as Task;

      await saveLocalTask({
        ...updatedTask,
        syncStatus: isOnline ? 'pending' : 'local',
      });

      // Queue for sync
      if (isOnline) {
        await queueSyncJob(currentFarmId, 'complete-task', {
          method: 'PATCH',
          endpoint: `/api/tasks/${taskId}/complete`,
          body: { proofOfWork },
        });
      }

      return updatedTask;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
}
