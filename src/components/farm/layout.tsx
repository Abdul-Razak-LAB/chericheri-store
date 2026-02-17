'use client';

import { useEffect } from 'react';
import { UserButton } from '@clerk/nextjs';
import { FarmNavigation } from '@/src/components/farm/navigation';
import { OfflineStatusBanner, OfflineStatusIndicator } from '@/src/components/farm/offline-status';
import { useOfflineSync, useServiceWorker } from '@/src/lib/hooks/use-offline-sync';
import { useAppStore } from '@/src/stores/app-store';
import { cn } from '@/src/lib/utils';

export function FarmLayout({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  
  // Initialize offline sync
  useOfflineSync();
  
  // Register service worker
  useServiceWorker();

  return (
    <div className="min-h-screen bg-background">
      {/* Offline status banner */}
      <OfflineStatusBanner />

      {/* Sidebar navigation */}
      <FarmNavigation />

      {/* Main content */}
      <div
        className={cn(
          'min-h-screen transition-all',
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          <div className="flex-1">
            {/* Spacer for mobile menu button */}
            <div className="h-10 w-10 lg:hidden" />
          </div>

          <div className="flex items-center gap-4">
            <OfflineStatusIndicator />
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
