export interface IntakeRecord {
  id?: number;
  localId: string;
  farmerName: string;
  farmerPhone: string;
  plotRef: string;
  harvestTimestamp: string;
  intakeTimestamp: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  brix: number;
  floatersPct: number;
  baseRatePerKg: number;
  premiumPerKg: number;
  totalPayoutRs: number;
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
  syncedAt?: string;
  errorMessage?: string;
}

const DB_NAME = 'XimalayaIntakeDB';
const DB_VERSION = 1;
const STORE_NAME = 'cherry_intakes';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'localId' });
        store.createIndex('syncStatus', 'syncStatus', { unique: false });
        store.createIndex('intakeTimestamp', 'intakeTimestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineIntake(record: IntakeRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingIntakes(): Promise<IntakeRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('syncStatus');
    const request = index.getAll('PENDING');

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllLocalIntakes(): Promise<IntakeRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const records = (request.result || []) as IntakeRecord[];
      records.sort((a, b) => new Date(b.intakeTimestamp).getTime() - new Date(a.intakeTimestamp).getTime());
      resolve(records);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function markIntakeSynced(localId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(localId);

    getReq.onsuccess = () => {
      const item = getReq.result;
      if (item) {
        item.syncStatus = 'SYNCED';
        item.syncedAt = new Date().toISOString();
        store.put(item);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
