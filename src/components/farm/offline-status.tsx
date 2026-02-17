'use client';

import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/src/stores/app-store';
import { useOfflineSync } from '@/src/lib/hooks/use-offline-sync';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/src/lib/utils';

export function OfflineStatusBanner() {
  const { isOnline, isSyncing, pendingCount, failedCount } = useAppStore();
  const { triggerSync } = useOfflineSync();

  if (isOnline && pendingCount === 0 && failedCount === 0) {
    return null; // Don't show banner when everything is synced
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-4 py-2 text-sm',
        isOnline
          ? 'bg-yellow-50 text-yellow-900 border-b border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800'
          : 'bg-red-50 text-red-900 border-b border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800'
      )}
    >
      <div className="flex items-center gap-2 flex-1">
        {isOnline ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        
        <span className="font-medium">
          {isOnline
            ? isSyncing
              ? 'Syncing...'
              : 'Pending changes'
            : 'Offline mode'}
        </span>

        {pendingCount > 0 && (
          <Badge variant="warning" className="ml-2">
            {pendingCount} pending
          </Badge>
        )}

        {failedCount > 0 && (
          <Badge variant="destructive" className="ml-2">
            {failedCount} failed
          </Badge>
        )}
      </div>

      {isOnline && !isSyncing && (
        <Button
          variant="ghost"
          size="sm"
          onClick={triggerSync}
          className="h-8 gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sync now</span>
        </Button>
      )}

      {!isOnline && (
        <div className="flex items-center gap-1.5 text-xs">
          <AlertCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Changes will sync when online</span>
        </div>
      )}
    </div>
  );
}

export function OfflineStatusIndicator() {
  const { isOnline, isSyncing, pendingCount, failedCount } = useAppStore();
  const { triggerSync } = useOfflineSync();

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
          isOnline
            ? pendingCount > 0 || failedCount > 0
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        )}
      >
        {isOnline ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </div>

      {isOnline && (pendingCount > 0 || failedCount > 0) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={triggerSync}
          disabled={isSyncing}
          className="h-7 w-7"
          title="Sync now"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isSyncing && 'animate-spin')} />
        </Button>
      )}
    </div>
  );
}
