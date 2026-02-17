import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface OutboxJob {
  id: string;
  farmId: string;
  type: string;
  payload: unknown;
  status: 'PENDING' | 'FAILED' | 'SYNCED';
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: number;
  lastError?: string;
  createdAt: number;
  updatedAt: number;
}

export interface LocalTask {
  id: string;
  farmId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  proofOfWork?: {
    photos?: Array<{ id: string; url: string; }>;
    videos?: Array<{ id: string; url: string; }>;
    audio?: Array<{ id: string; url: string; }>;
    notes?: string;
    gps?: { lat: number; lng: number };
    timestamp: string;
  };
  syncStatus: 'local' | 'synced' | 'pending';
  createdAt: number;
  updatedAt: number;
  completedAt?: string;
}

export interface LocalMedia {
  id: string;
  farmId: string;
  type: 'photo' | 'video' | 'audio';
  blob: Blob;
  metadata: {
    taskId?: string;
    gps?: { lat: number; lng: number };
    timestamp: number;
    compressed: boolean;
  };
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'failed';
  uploadUrl?: string;
  createdAt: number;
}

export interface SyncMeta {
  key: string;
  farmId: string;
  lastSyncAt: number;
  syncCursor?: string;
  metadata?: unknown;
}

export interface LocalEvent {
  id: string;
  farmId: string;
  eventType: string;
  data: unknown;
  timestamp: number;
  syncStatus: 'local' | 'synced';
}

interface FarmOpsDB extends DBSchema {
  outbox_jobs: {
    key: string;
    value: OutboxJob;
    indexes: {
      'by-farmId': string;
      'by-status': string;
      'by-farmId-status': [string, string];
      'by-nextAttempt': number;
    };
  };
  local_tasks: {
    key: string;
    value: LocalTask;
    indexes: {
      'by-farmId': string;
      'by-status': string;
      'by-farmId-status': [string, string];
      'by-dueDate': number;
    };
  };
  local_media: {
    key: string;
    value: LocalMedia;
    indexes: {
      'by-farmId': string;
      'by-uploadStatus': string;
      'by-taskId': string;
    };
  };
  sync_meta: {
    key: string;
    value: SyncMeta;
    indexes: {
      'by-farmId': string;
    };
  };
  local_events: {
    key: string;
    value: LocalEvent;
    indexes: {
      'by-farmId': string;
      'by-syncStatus': string;
      'by-timestamp': number;
    };
  };
}

const DB_NAME = 'farmops-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<FarmOpsDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<FarmOpsDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<FarmOpsDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`[IndexedDB] Upgrading from v${oldVersion} to v${newVersion}`);

      // Create outbox_jobs store
      if (!db.objectStoreNames.contains('outbox_jobs')) {
        const outboxStore = db.createObjectStore('outbox_jobs', { keyPath: 'id' });
        outboxStore.createIndex('by-farmId', 'farmId');
        outboxStore.createIndex('by-status', 'status');
        outboxStore.createIndex('by-farmId-status', ['farmId', 'status']);
        outboxStore.createIndex('by-nextAttempt', 'nextAttemptAt');
      }

      // Create local_tasks store
      if (!db.objectStoreNames.contains('local_tasks')) {
        const tasksStore = db.createObjectStore('local_tasks', { keyPath: 'id' });
        tasksStore.createIndex('by-farmId', 'farmId');
        tasksStore.createIndex('by-status', 'status');
        tasksStore.createIndex('by-farmId-status', ['farmId', 'status']);
        tasksStore.createIndex('by-dueDate', 'dueDate');
      }

      // Create local_media store
      if (!db.objectStoreNames.contains('local_media')) {
        const mediaStore = db.createObjectStore('local_media', { keyPath: 'id' });
        mediaStore.createIndex('by-farmId', 'farmId');
        mediaStore.createIndex('by-uploadStatus', 'uploadStatus');
        mediaStore.createIndex('by-taskId', 'metadata.taskId');
      }

      // Create sync_meta store
      if (!db.objectStoreNames.contains('sync_meta')) {
        const syncStore = db.createObjectStore('sync_meta', { keyPath: 'key' });
        syncStore.createIndex('by-farmId', 'farmId');
      }

      // Create local_events store
      if (!db.objectStoreNames.contains('local_events')) {
        const eventsStore = db.createObjectStore('local_events', { keyPath: 'id' });
        eventsStore.createIndex('by-farmId', 'farmId');
        eventsStore.createIndex('by-syncStatus', 'syncStatus');
        eventsStore.createIndex('by-timestamp', 'timestamp');
      }
    },
    blocked() {
      console.warn('[IndexedDB] Database upgrade blocked. Please close other tabs.');
    },
    blocking() {
      console.warn('[IndexedDB] This tab is blocking a database upgrade.');
      if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
      }
    },
    terminated() {
      console.error('[IndexedDB] Database connection terminated unexpectedly.');
      dbInstance = null;
    },
  });

  return dbInstance;
}

// Outbox operations
export async function addToOutbox(job: Omit<OutboxJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = await getDB();
  const id = `${job.farmId}-${job.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();
  
  await db.add('outbox_jobs', {
    ...job,
    id,
    createdAt: now,
    updatedAt: now,
  });
  
  return id;
}

export async function getPendingOutboxJobs(farmId: string): Promise<OutboxJob[]> {
  const db = await getDB();
  const now = Date.now();
  
  const allPending = await db.getAllFromIndex('outbox_jobs', 'by-farmId-status', [farmId, 'PENDING']);
  
  // Filter by nextAttemptAt
  return allPending.filter(job => job.nextAttemptAt <= now);
}

export async function updateOutboxJob(id: string, updates: Partial<OutboxJob>): Promise<void> {
  const db = await getDB();
  const existing = await db.get('outbox_jobs', id);
  
  if (!existing) {
    throw new Error(`Outbox job ${id} not found`);
  }
  
  await db.put('outbox_jobs', {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteOutboxJob(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('outbox_jobs', id);
}

export async function getOutboxStats(farmId: string): Promise<{
  pending: number;
  failed: number;
  total: number;
}> {
  const db = await getDB();
  
  const pending = await db.countFromIndex('outbox_jobs', 'by-farmId-status', [farmId, 'PENDING']);
  const failed = await db.countFromIndex('outbox_jobs', 'by-farmId-status', [farmId, 'FAILED']);
  const all = await db.getAllFromIndex('outbox_jobs', 'by-farmId', farmId);
  
  return {
    pending,
    failed,
    total: all.length,
  };
}

// Task operations
export async function saveLocalTask(task: Omit<LocalTask, 'createdAt' | 'updatedAt'>): Promise<void> {
  const db = await getDB();
  const existing = await db.get('local_tasks', task.id);
  const now = Date.now();
  
  await db.put('local_tasks', {
    ...task,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  });
}

export async function getLocalTasks(farmId: string, status?: string): Promise<LocalTask[]> {
  const db = await getDB();
  
  if (status) {
    return db.getAllFromIndex('local_tasks', 'by-farmId-status', [farmId, status]);
  }
  
  return db.getAllFromIndex('local_tasks', 'by-farmId', farmId);
}

export async function deleteLocalTask(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('local_tasks', id);
}

// Media operations
export async function saveLocalMedia(media: Omit<LocalMedia, 'createdAt'>): Promise<void> {
  const db = await getDB();
  
  await db.put('local_media', {
    ...media,
    createdAt: Date.now(),
  });
}

export async function getLocalMedia(farmId: string, uploadStatus?: string): Promise<LocalMedia[]> {
  const db = await getDB();
  
  if (uploadStatus) {
    const all = await db.getAllFromIndex('local_media', 'by-uploadStatus', uploadStatus);
    return all.filter(m => m.farmId === farmId);
  }
  
  return db.getAllFromIndex('local_media', 'by-farmId', farmId);
}

export async function deleteLocalMedia(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('local_media', id);
}

// Sync meta operations
export async function updateSyncMeta(key: string, farmId: string, metadata?: unknown): Promise<void> {
  const db = await getDB();
  
  await db.put('sync_meta', {
    key,
    farmId,
    lastSyncAt: Date.now(),
    metadata,
  });
}

export async function getSyncMeta(key: string): Promise<SyncMeta | undefined> {
  const db = await getDB();
  return db.get('sync_meta', key);
}

// Event operations
export async function saveLocalEvent(event: Omit<LocalEvent, 'timestamp'>): Promise<void> {
  const db = await getDB();
  
  await db.add('local_events', {
    ...event,
    timestamp: Date.now(),
  });
}

export async function getUnsyncedEvents(farmId: string): Promise<LocalEvent[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('local_events', 'by-syncStatus', 'local');
  return all.filter(e => e.farmId === farmId);
}

export async function markEventSynced(id: string): Promise<void> {
  const db = await getDB();
  const event = await db.get('local_events', id);
  
  if (event) {
    await db.put('local_events', {
      ...event,
      syncStatus: 'synced',
    });
  }
}

// Clear all farm data (for logout/farm switch)
export async function clearFarmData(farmId: string): Promise<void> {
  const db = await getDB();
  
  // Clear outbox_jobs
  const outboxKeys = await db.getAllKeysFromIndex('outbox_jobs', 'by-farmId', farmId);
  await Promise.all(outboxKeys.map(key => db.delete('outbox_jobs', key)));
  
  // Clear local_tasks
  const taskKeys = await db.getAllKeysFromIndex('local_tasks', 'by-farmId', farmId);
  await Promise.all(taskKeys.map(key => db.delete('local_tasks', key)));
  
  // Clear local_media
  const mediaKeys = await db.getAllKeysFromIndex('local_media', 'by-farmId', farmId);
  await Promise.all(mediaKeys.map(key => db.delete('local_media', key)));
  
  // Clear sync_meta
  const syncKeys = await db.getAllKeysFromIndex('sync_meta', 'by-farmId', farmId);
  await Promise.all(syncKeys.map(key => db.delete('sync_meta', key)));
  
  // Clear local_events
  const eventKeys = await db.getAllKeysFromIndex('local_events', 'by-farmId', farmId);
  await Promise.all(eventKeys.map(key => db.delete('local_events', key)));
}
