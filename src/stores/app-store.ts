import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole, Farm } from '@/src/types';

export interface AppState {
  // User & Farm
  currentFarmId: string | null;
  userRole: UserRole | null;
  
  // Connection status
  isOnline: boolean;
  
  // Sync status
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  lastSyncAt: number | null;
  
  // UI state
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // Actions
  setCurrentFarm: (farmId: string) => void;
  setUserRole: (role: UserRole) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  setSyncStatus: (isSyncing: boolean) => void;
  setPendingCount: (count: number) => void;
  setFailedCount: (count: number) => void;
  setLastSyncAt: (timestamp: number) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  reset: () => void;
}

const initialState = {
  currentFarmId: null,
  userRole: null,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  pendingCount: 0,
  failedCount: 0,
  lastSyncAt: null,
  sidebarOpen: true,
  theme: 'system' as const,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentFarm: (farmId) => set({ currentFarmId: farmId }),
      
      setUserRole: (role) => set({ userRole: role }),
      
      setOnlineStatus: (isOnline) => set({ isOnline }),
      
      setSyncStatus: (isSyncing) => set({ isSyncing }),
      
      setPendingCount: (count) => set({ pendingCount: count }),
      
      setFailedCount: (count) => set({ failedCount: count }),
      
      setLastSyncAt: (timestamp) => set({ lastSyncAt: timestamp }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setTheme: (theme) => set({ theme }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'farmops-app-state',
      partialize: (state) => ({
        currentFarmId: state.currentFarmId,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
