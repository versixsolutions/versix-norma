// ============================================================
// VERSIX NORMA - OFFLINE DATABASE
// IndexedDB para dados críticos offline
// ============================================================

import { DBSchema, IDBPDatabase, openDB } from 'idb';

// ============================================
// SCHEMA
// ============================================
interface VersixOfflineDB extends DBSchema {
  // Dados críticos de emergência
  'critical-data': {
    key: string;
    value: CriticalData;
  };

  // Ações pendentes para sync
  'pending-actions': {
    key: string;
    value: PendingAction;
    indexes: {
      'by-timestamp': number;
      'by-type': string;
    };
  };

  // Cache de comunicados
  comunicados: {
    key: string;
    value: CachedComunicado;
    indexes: {
      'by-date': string;
    };
  };

  // Cache de notificações
  notificacoes: {
    key: string;
    value: CachedNotificacao;
    indexes: {
      'by-lida': number;
    };
  };

  // Preferências do usuário
  preferences: {
    key: string;
    value: UserPreference;
  };
}

// ============================================
// TYPES
// ============================================
export interface CriticalData {
  condominio: {
    id: string;
    nome: string;
  };
  portaria?: {
    telefone: string;
    nome?: string;
  };
  sindico?: {
    telefone: string;
    nome: string;
  };
  moradoresVulneraveis?: Array<{
    unidade: string;
    nome: string;
    observacao?: string;
  }>;
  emergencias?: Array<{
    tipo: string;
    telefone: string;
    nome: string;
  }>;
  lastSync: number;
}

export interface PendingAction {
  id: string;
  type: 'ocorrencia' | 'chamado' | 'reserva' | 'voto';
  method: 'POST' | 'PUT' | 'DELETE';
  url: string;
  body: unknown;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
}

export interface CachedComunicado {
  id: string;
  titulo: string;
  corpo: string;
  tipo: string;
  publicadoEm: string;
  lido: boolean;
}

export interface CachedNotificacao {
  id: string;
  titulo: string;
  corpo: string;
  tipo: string;
  criadoEm: string;
  lida: boolean;
}

export interface UserPreference {
  key: string;
  value: unknown;
}

// ============================================
// DATABASE INSTANCE
// ============================================
const DB_NAME = 'versix-offline';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<VersixOfflineDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<VersixOfflineDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<VersixOfflineDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Critical Data Store
      if (!db.objectStoreNames.contains('critical-data')) {
        db.createObjectStore('critical-data');
      }

      // Pending Actions Store
      if (!db.objectStoreNames.contains('pending-actions')) {
        const pendingStore = db.createObjectStore('pending-actions', {
          keyPath: 'id',
        });
        pendingStore.createIndex('by-timestamp', 'timestamp');
        pendingStore.createIndex('by-type', 'type');
      }

      // Comunicados Store
      if (!db.objectStoreNames.contains('comunicados')) {
        const comunicadosStore = db.createObjectStore('comunicados', {
          keyPath: 'id',
        });
        comunicadosStore.createIndex('by-date', 'publicadoEm');
      }

      // Notificações Store
      if (!db.objectStoreNames.contains('notificacoes')) {
        const notificacoesStore = db.createObjectStore('notificacoes', {
          keyPath: 'id',
        });
        notificacoesStore.createIndex('by-lida', 'lida');
      }

      // Preferences Store
      if (!db.objectStoreNames.contains('preferences')) {
        db.createObjectStore('preferences', { keyPath: 'key' });
      }
    },
    blocked() {
      console.warn('Database blocked - close other tabs');
    },
    blocking() {
      dbInstance?.close();
      dbInstance = null;
    },
    terminated() {
      dbInstance = null;
    },
  });

  return dbInstance;
}

// ============================================
// CRITICAL DATA OPERATIONS
// ============================================
export async function saveCriticalData(data: CriticalData): Promise<void> {
  const db = await getDB();
  await db.put('critical-data', { ...data, lastSync: Date.now() }, 'emergency');
}

export async function getCriticalData(): Promise<CriticalData | undefined> {
  const db = await getDB();
  return db.get('critical-data', 'emergency');
}

export async function syncCriticalData(): Promise<void> {
  try {
    const response = await fetch('/api/critical-data');
    if (!response.ok) throw new Error('Falha ao buscar dados');

    const data = await response.json();
    await saveCriticalData(data);

    console.log('Dados críticos sincronizados');
  } catch (error) {
    console.error('Erro ao sincronizar dados críticos:', error);
    throw error;
  }
}

// ============================================
// PENDING ACTIONS OPERATIONS
// ============================================
export async function addPendingAction(
  action: Omit<PendingAction, 'id' | 'timestamp' | 'retries'>
): Promise<string> {
  const db = await getDB();
  const id = crypto.randomUUID();

  await db.add('pending-actions', {
    ...action,
    id,
    timestamp: Date.now(),
    retries: 0,
  });

  // Registrar sync se disponível
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    await (
      registration as ServiceWorkerRegistration & {
        sync: { register: (tag: string) => Promise<void> };
      }
    ).sync.register('sync-offline-actions');
  }

  return id;
}

export async function getPendingActions(): Promise<PendingAction[]> {
  const db = await getDB();
  return db.getAllFromIndex('pending-actions', 'by-timestamp');
}

export async function removePendingAction(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('pending-actions', id);
}

export async function updatePendingActionRetries(id: string): Promise<void> {
  const db = await getDB();
  const action = await db.get('pending-actions', id);
  if (action) {
    action.retries += 1;
    await db.put('pending-actions', action);
  }
}

export async function syncPendingActions(): Promise<{ success: number; failed: number }> {
  const actions = await getPendingActions();
  let success = 0;
  let failed = 0;

  for (const action of actions) {
    try {
      const response = await fetch(action.url, {
        method: action.method,
        headers: {
          'Content-Type': 'application/json',
          ...action.headers,
        },
        body: JSON.stringify(action.body),
      });

      if (response.ok) {
        await removePendingAction(action.id);
        success++;
      } else {
        await updatePendingActionRetries(action.id);
        failed++;
      }
    } catch {
      await updatePendingActionRetries(action.id);
      failed++;
    }
  }

  return { success, failed };
}

// ============================================
// COMUNICADOS CACHE
// ============================================
export async function cacheComunicados(comunicados: CachedComunicado[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('comunicados', 'readwrite');

  await Promise.all([...comunicados.map((c) => tx.store.put(c)), tx.done]);
}

export async function getCachedComunicados(limit = 20): Promise<CachedComunicado[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('comunicados', 'by-date');
  return all.slice(-limit).reverse();
}

export async function markComunicadoAsRead(id: string): Promise<void> {
  const db = await getDB();
  const comunicado = await db.get('comunicados', id);
  if (comunicado) {
    comunicado.lido = true;
    await db.put('comunicados', comunicado);
  }
}

// ============================================
// NOTIFICAÇÕES CACHE
// ============================================
export async function cacheNotificacoes(notificacoes: CachedNotificacao[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('notificacoes', 'readwrite');

  await Promise.all([...notificacoes.map((n) => tx.store.put(n)), tx.done]);
}

export async function getCachedNotificacoes(): Promise<CachedNotificacao[]> {
  const db = await getDB();
  return db.getAll('notificacoes');
}

export async function getUnreadNotificacoesCount(): Promise<number> {
  const db = await getDB();
  const unread = await db.getAllFromIndex('notificacoes', 'by-lida', IDBKeyRange.only(0));
  return unread.length;
}

// ============================================
// PREFERENCES
// ============================================

export async function setPreference<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  await db.put('preferences', { key, value });
}

export async function getPreference<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  const pref = await db.get('preferences', key);
  return pref?.value as T | undefined;
}

// ============================================
// CLEANUP
// ============================================
export async function clearOldData(maxAge = 7 * 24 * 60 * 60 * 1000): Promise<void> {
  const db = await getDB();
  const cutoff = Date.now() - maxAge;

  // Limpar ações pendentes antigas
  const pendingActions = await getPendingActions();
  for (const action of pendingActions) {
    if (action.timestamp < cutoff || action.retries > 5) {
      await removePendingAction(action.id);
    }
  }

  // Limpar notificações antigas
  const notificacoes = await getCachedNotificacoes();
  const tx = db.transaction('notificacoes', 'readwrite');
  for (const n of notificacoes) {
    if (new Date(n.criadoEm).getTime() < cutoff) {
      await tx.store.delete(n.id);
    }
  }
  await tx.done;
}

// ============================================
// STORAGE ESTIMATE
// ============================================
export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  percentage: number;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;

    return {
      usage,
      quota,
      percentage: quota > 0 ? Math.round((usage / quota) * 100) : 0,
    };
  }

  return { usage: 0, quota: 0, percentage: 0 };
}

// ============================================
// EXPORT DATABASE
// ============================================
export async function exportData(): Promise<string> {
  const db = await getDB();

  const data = {
    criticalData: await db.get('critical-data', 'emergency'),
    pendingActions: await db.getAll('pending-actions'),
    comunicados: await db.getAll('comunicados'),
    notificacoes: await db.getAll('notificacoes'),
    preferences: await db.getAll('preferences'),
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(data, null, 2);
}
