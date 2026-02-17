'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle2, XCircle, Clock, Database, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { useAppStore } from '@/src/stores/app-store';
import { useOfflineSync, useStorageQuota } from '@/src/lib/hooks/use-offline-sync';
import { formatRelativeTime } from '@/src/lib/utils';

export default function SyncCenterPage() {
  const {
    isOnline,
    isSyncing,
    pendingCount,
    failedCount,
    lastSyncAt,
  } = useAppStore();
  
  const { triggerSync } = useOfflineSync();
  const { checkQuota } = useStorageQuota();
  
  const [storageInfo, setStorageInfo] = useState<any>(null);

  useEffect(() => {
    checkQuota().then(setStorageInfo);
  }, [checkQuota]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sync Center</h1>
          <p className="text-muted-foreground">
            Manage offline data and synchronization
          </p>
        </div>
        <Button
          onClick={triggerSync}
          disabled={!isOnline || isSyncing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <WifiOff className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              )}
              <div>
                <CardTitle>Connection Status</CardTitle>
                <CardDescription>
                  {isOnline ? 'Connected to server' : 'Working offline'}
                </CardDescription>
              </div>
            </div>
            <Badge variant={isOnline ? 'success' : 'destructive'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Sync Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Changes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Waiting to sync
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Failed Syncs
            </CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{failedCount}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Last Sync
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastSyncAt ? formatRelativeTime(new Date(lastSyncAt)) : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isSyncing ? 'Syncing now...' : 'Last successful sync'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Storage Usage */}
      {storageInfo && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Storage Usage</CardTitle>
                <CardDescription>
                  Local data storage information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Used</span>
                  <span className="font-medium">
                    {storageInfo.formattedUsage} / {storageInfo.formattedQuota}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full transition-all ${
                      storageInfo.nearLimit
                        ? 'bg-destructive'
                        : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                  />
                </div>
              </div>
              
              {storageInfo.nearLimit && (
                <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Warning:</strong> You're using {storageInfo.percentage.toFixed(1)}% 
                    of your available storage. Consider clearing old data or completing pending syncs.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How Offline Sync Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Offline Sync Works</CardTitle>
          <CardDescription>
            Understanding FarmOps offline-first architecture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div>
                <h4 className="font-medium">Local-First Storage</h4>
                <p className="text-sm text-muted-foreground">
                  All your actions are saved locally first using IndexedDB, 
                  ensuring zero data loss even when offline.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div>
                <h4 className="font-medium">Automatic Sync</h4>
                <p className="text-sm text-muted-foreground">
                  When online, changes sync automatically in the background with 
                  smart retry logic and exponential backoff.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div>
                <h4 className="font-medium">Conflict Resolution</h4>
                <p className="text-sm text-muted-foreground">
                  Server-side timestamps ensure the latest data always wins, 
                  preventing sync conflicts.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <span className="text-sm font-bold text-primary">4</span>
              </div>
              <div>
                <h4 className="font-medium">Manual Control</h4>
                <p className="text-sm text-muted-foreground">
                  You can manually trigger sync anytime or retry failed operations 
                  from this sync center.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offline Tips */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-200">
            Tips for Working Offline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>Compress photos before capturing to save storage space</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>Keep video recordings under 15 seconds when offline</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>Sync regularly when you have a connection to avoid storage issues</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>Monitor storage usage and clear synced data periodically</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
