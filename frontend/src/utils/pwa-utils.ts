import { openDB } from 'idb';

const DB_NAME = 'nepa-offline-db';
const STORE_NAME = 'classification-history';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const saveOfflineClassification = async (classification: any) => {
  const db = await initDB();
  return db.add(STORE_NAME, {
    ...classification,
    timestamp: new Date().toISOString()
  });
};

export const getOfflineHistory = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    } catch (err) {
      console.log('ServiceWorker registration failed: ', err);
    }
  }
};

export const isOnline = () => navigator.onLine;

export const syncOfflineData = async () => {
  if (!isOnline()) return;
  const history = await getOfflineHistory();
  if (history.length === 0) return;

  // Assuming we have an API endpoint to sync data
  try {
    for (const item of history) {
      const response = await fetch('/api/sync-classification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (response.ok) {
        const db = await initDB();
        await db.delete(STORE_NAME, item.id);
      }
    }
    console.log('Offline history synced successfully');
  } catch (error) {
    console.error('Data synchronization failed', error);
  }
};
