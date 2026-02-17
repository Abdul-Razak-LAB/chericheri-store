import { create } from 'zustand';
import type { Task } from '@/src/types';

export interface TaskWorkflowState {
  // Current task being edited/viewed
  currentTask: Task | null;
  
  // Proof of work capture state
  capturedPhotos: File[];
  capturedVideos: File[];
  capturedAudio: File | null;
  captureLocation: { lat: number; lng: number } | null;
  
  // Filter/sort state
  statusFilter: 'all' | 'pending' | 'in_progress' | 'completed' | 'overdue';
  sortBy: 'dueDate' | 'priority' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  
  // Actions
  setCurrentTask: (task: Task | null) => void;
  addPhoto: (photo: File) => void;
  removePhoto: (index: number) => void;
  addVideo: (video: File) => void;
  removeVideo: (index: number) => void;
  setAudio: (audio: File | null) => void;
  setCaptureLocation: (location: { lat: number; lng: number } | null) => void;
  clearCaptures: () => void;
  setStatusFilter: (filter: TaskWorkflowState['statusFilter']) => void;
  setSortBy: (sortBy: TaskWorkflowState['sortBy']) => void;
  setSortOrder: (order: TaskWorkflowState['sortOrder']) => void;
  reset: () => void;
}

const initialState = {
  currentTask: null,
  capturedPhotos: [],
  capturedVideos: [],
  capturedAudio: null,
  captureLocation: null,
  statusFilter: 'all' as const,
  sortBy: 'dueDate' as const,
  sortOrder: 'asc' as const,
};

export const useTaskWorkflowStore = create<TaskWorkflowState>((set) => ({
  ...initialState,

  setCurrentTask: (task) => set({ currentTask: task }),

  addPhoto: (photo) =>
    set((state) => ({
      capturedPhotos: [...state.capturedPhotos, photo],
    })),

  removePhoto: (index) =>
    set((state) => ({
      capturedPhotos: state.capturedPhotos.filter((_, i) => i !== index),
    })),

  addVideo: (video) =>
    set((state) => ({
      capturedVideos: [...state.capturedVideos, video],
    })),

  removeVideo: (index) =>
    set((state) => ({
      capturedVideos: state.capturedVideos.filter((_, i) => i !== index),
    })),

  setAudio: (audio) => set({ capturedAudio: audio }),

  setCaptureLocation: (location) => set({ captureLocation: location }),

  clearCaptures: () =>
    set({
      capturedPhotos: [],
      capturedVideos: [],
      capturedAudio: null,
      captureLocation: null,
    }),

  setStatusFilter: (filter) => set({ statusFilter: filter }),

  setSortBy: (sortBy) => set({ sortBy }),

  setSortOrder: (order) => set({ sortOrder: order }),

  reset: () => set(initialState),
}));
