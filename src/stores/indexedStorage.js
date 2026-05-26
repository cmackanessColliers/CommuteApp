import { openDB } from "idb";

const DB_NAME = "app-state-store";
const STORE_NAME = "zustand";
const DB_VERSION = 1;

async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export const indexedDBStorage = {
  // Returns string or null, but zustand persist supports Promise
  async getItem(name) {
    const db = await getDb();
    const val = await db.get(STORE_NAME, name);
    // Persist expects raw string; we store raw string from replacer
    return val ?? null;
  },
  async setItem(name, value) {
    const db = await getDb();
    await db.put(STORE_NAME, value, name);
  },
  async removeItem(name) {
    const db = await getDb();
    await db.delete(STORE_NAME, name);
  },
};

export default indexedDBStorage;
