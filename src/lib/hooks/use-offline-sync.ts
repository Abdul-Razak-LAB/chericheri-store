import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/src/stores/app-store';
import { processSyncQueue, getSyncQueueStats, setupSyncTriggers } from '../api/sync-queue';
import { getOutboxStats } from '../db/indexeddb';

/**
 * Hook to manage online/offline status and sync operations
 */
export function useOfflineSync() {
  const {
    currentFarmId,
    isOnline,
    isSyncing,
    setOnlineStatus,
    setSyncStatus,
    setPendingCount,
    setFailedCount,
    setLastSyncAt,
  } = useAppStore();

  /**
   * Manually trigger sync
   */
  const triggerSync = useCallback(async () => {
    if (!currentFarmId || !isOnline || isSyncing) {
      return;
    }

    setSyncStatus(true);
    try {
      await processSyncQueue(currentFarmId);
      setLastSyncAt(Date.now());
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncStatus(false);
      await updateSyncStats();
    }
  }, [currentFarmId, isOnline, isSyncing, setSyncStatus, setLastSyncAt]);

  /**
   * Update sync statistics
   */
  const updateSyncStats = useCallback(async () => {
    if (!currentFarmId) return;

    try {
      const stats = await getOutboxStats(currentFarmId);
      setPendingCount(stats.pending);
      setFailedCount(stats.failed);
    } catch (error) {
      console.error('Failed to update sync stats:', error);
    }
  }, [currentFarmId, setPendingCount, setFailedCount]);

  /**
   * Setup online/offline listeners
   */
  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      console.log('[Offline Sync] Back online');
    };

    const handleOffline = () => {
      setOnlineStatus(false);
      console.log('[Offline Sync] Gone offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial status
    setOnlineStatus(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  /**
   * Setup automatic sync triggers
   */
  useEffect(() => {
    if (!currentFarmId) return;

    const cleanup = setupSyncTriggers(currentFarmId);
    
    // Initial sync stats update
    updateSyncStats();
    
    // Update stats periodically
    const interval = setInterval(updateSyncStats, 10000); // Every 10 seconds

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [currentFarmId, updateSyncStats]);

  return {
    isOnline,
    isSyncing,
    triggerSync,
    updateSyncStats,
  };
}

/**
 * Hook for service worker registration
 */
export function useServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] Service Worker registered:', registration);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute

          // Listen for new service worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                console.log('[SW] New version available');
                
                // Notify user about update
                if (confirm('A new version is available. Reload to update?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error('[SW] Service Worker registration failed:', error);
        });

      // Listen for controller change (new service worker activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] New service worker activated');
        window.location.reload();
      });
    } else {
      console.warn('[SW] Service Workers not supported');
    }
  }, []);
}

/**
 * Hook to check storage quota
 */
export function useStorageQuota() {
  const checkQuota = useCallback(async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (usage / quota) * 100 : 0;

      return {
        usage,
        quota,
        percentage,
        nearLimit: percentage > 80,
        formattedUsage: formatBytes(usage),
        formattedQuota: formatBytes(quota),
      };
    }

    return null;
  }, []);

  return { checkQuota };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
