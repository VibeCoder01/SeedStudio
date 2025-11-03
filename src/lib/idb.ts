
import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'SeedStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function addImage(id: string, dataUrl: string): Promise<void> {
  const db = await getDb();
  await db.put(STORE_NAME, { id, dataUrl });
}

export async function getImage(id: string): Promise<string | undefined> {
  const db = await getDb();
  const result = await db.get(STORE_NAME, id);
  return result?.dataUrl;
}

export async function deleteImage(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}
