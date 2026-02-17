import {
  addToOutbox,
  getPendingOutboxJobs,
  updateOutboxJob,
  deleteOutboxJob,
  type OutboxJob,
} from '../db/indexeddb';

const MAX_BATCH_SIZE = 10;
const BASE_DELAY = 1000; // 1 second
const MAX_DELAY = 300000; // 5 minutes
const JITTER_FACTOR = 0.2; // 20% jitter

// Track in-flight sync operations to prevent duplicates
const inFlightSyncs = new Set<string>();

export interface SyncJobPayload {
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Calculate exponential backoff delay with jitter
 */
function calculateBackoff(attempts: number): number {
  const exponentialDelay = Math.min(BASE_DELAY * Math.pow(2, attempts), MAX_DELAY);
  const jitter = exponentialDelay * JITTER_FACTOR * (Math.random() - 0.5);
  return Math.floor(exponentialDelay + jitter);
}

/**
 * Queue a sync job to the outbox
 */
export async function queueSyncJob(
  farmId: string,
  type: string,
  payload: SyncJobPayload,
  maxAttempts = 5
): Promise<string> {
  const jobId = await addToOutbox({
    farmId,
    type,
    payload,
    status: 'PENDING',
    attempts: 0,
    maxAttempts,
    nextAttemptAt: Date.now(), // Attempt immediately
  });

  console.log('[Sync Queue] Queued job:', { jobId, type, farmId });

  // Trigger sync if online
  if (navigator.onLine) {
    setTimeout(() => processSyncQueue(farmId), 100);
  }

  return jobId;
}

/**
 * Process pending sync jobs for a farm
 */
export async function processSyncQueue(farmId: string): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  // Check if sync is already in flight for this farm
  if (inFlightSyncs.has(farmId)) {
    console.log('[Sync Queue] Sync already in progress for farm:', farmId);
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  if (!navigator.onLine) {
    console.log('[Sync Queue] Skipping sync - offline');
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  inFlightSyncs.add(farmId);

  try {
    const pendingJobs = await getPendingOutboxJobs(farmId);
    
    // Limit batch size
    const jobsToProcess = pendingJobs.slice(0, MAX_BATCH_SIZE);

    if (jobsToProcess.length === 0) {
      console.log('[Sync Queue] No pending jobs for farm:', farmId);
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    console.log(`[Sync Queue] Processing ${jobsToProcess.length} jobs for farm:`, farmId);

    let succeeded = 0;
    let failed = 0;

    // Process jobs sequentially to maintain order
    for (const job of jobsToProcess) {
      try {
        await processJob(job);
        succeeded++;
        await deleteOutboxJob(job.id);
      } catch (error) {
        failed++;
        await handleJobFailure(job, error);
      }
    }

    console.log('[Sync Queue] Batch complete:', { 
      processed: jobsToProcess.length, 
      succeeded, 
      failed 
    });

    return {
      processed: jobsToProcess.length,
      succeeded,
      failed,
    };
  } finally {
    inFlightSyncs.delete(farmId);
  }
}

/**
 * Process a single sync job
 */
async function processJob(job: OutboxJob): Promise<void> {
  const payload = job.payload as SyncJobPayload;

  console.log('[Sync Queue] Processing job:', {
    id: job.id,
    type: job.type,
    attempts: job.attempts,
  });

  const response = await fetch(payload.endpoint, {
    method: payload.method,
    headers: {
      'Content-Type': 'application/json',
      ...payload.headers,
    },
    body: payload.body ? JSON.stringify(payload.body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error?.message || 'Unknown error');
  }

  console.log('[Sync Queue] Job succeeded:', job.id);
}

/**
 * Handle job failure with backoff
 */
async function handleJobFailure(job: OutboxJob, error: unknown): Promise<void> {
  const attempts = job.attempts + 1;
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';

  console.error('[Sync Queue] Job failed:', {
    id: job.id,
    attempts,
    maxAttempts: job.maxAttempts,
    error: errorMessage,
  });

  if (attempts >= job.maxAttempts) {
    // Mark as failed permanently
    await updateOutboxJob(job.id, {
      status: 'FAILED',
      attempts,
      lastError: errorMessage,
      nextAttemptAt: Date.now() + MAX_DELAY, // Far in the future
    });
    
    console.error('[Sync Queue] Job permanently failed:', job.id);
  } else {
    // Schedule retry with backoff
    const backoffDelay = calculateBackoff(attempts);
    await updateOutboxJob(job.id, {
      attempts,
      lastError: errorMessage,
      nextAttemptAt: Date.now() + backoffDelay,
    });
    
    console.log('[Sync Queue] Job will retry in', backoffDelay, 'ms');
  }
}

/**
 * Retry a failed job manually
 */
export async function retryFailedJob(jobId: string): Promise<void> {
  const job = await (await import('../db/indexeddb')).getDB()
    .then(db => db.get('outbox_jobs', jobId));
    
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  await updateOutboxJob(jobId, {
    status: 'PENDING',
    nextAttemptAt: Date.now(),
    lastError: undefined,
  });

  // Trigger immediate sync
  if (navigator.onLine) {
    setTimeout(() => processSyncQueue(job.farmId), 100);
  }
}

/**
 * Get sync queue statistics
 */
export async function getSyncQueueStats(farmId: string): Promise<{
  pending: number;
  failed: number;
  inFlight: boolean;
}> {
  const stats = await (await import('../db/indexeddb')).getOutboxStats(farmId);
  
  return {
    pending: stats.pending,
    failed: stats.failed,
    inFlight: inFlightSyncs.has(farmId),
  };
}

/**
 * Setup automatic sync triggers
 */
export function setupSyncTriggers(farmId: string): () => void {
  const syncHandler = () => {
    console.log('[Sync Queue] Network status changed, triggering sync');
    processSyncQueue(farmId).catch(console.error);
  };

  const visibilityHandler = () => {
    if (document.visibilityState === 'visible') {
      console.log('[Sync Queue] App became visible, triggering sync');
      processSyncQueue(farmId).catch(console.error);
    }
  };

  // Sync on network reconnection
  window.addEventListener('online', syncHandler);
  
  // Sync when app becomes visible
  document.addEventListener('visibilitychange', visibilityHandler);

  // Initial sync
  if (navigator.onLine) {
    setTimeout(() => processSyncQueue(farmId), 1000);
  }

  // Cleanup function
  return () => {
    window.removeEventListener('online', syncHandler);
    document.removeEventListener('visibilitychange', visibilityHandler);
  };
}

/**
 * Request background sync (best-effort, iOS may not support)
 */
export async function requestBackgroundSync(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('[Sync Queue] Service Worker not available');
    return false;
  }

  // Check if sync is supported (use type assertion as it's experimental)
  const swRegistration = ServiceWorkerRegistration.prototype as any;
  if (!('sync' in swRegistration)) {
    console.warn('[Sync Queue] Background Sync not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register('sync-outbox');
    console.log('[Sync Queue] Background sync registered');
    return true;
  } catch (error) {
    console.error('[Sync Queue] Failed to register background sync:', error);
    return false;
  }
}
