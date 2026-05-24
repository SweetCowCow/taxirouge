// 薄薄一層 IndexedDB wrapper：只暴露 key-value 與 collection append/list 兩種能力，
// 上層（save-state.ts）不應該知道任何 IDB request 細節。

const DB_NAME = "taiwan-yakouroku";
const DB_VERSION = 1;
const STORE_RUN = "run";
const STORE_CODEX = "codex";

const RUN_KEY = "current";

export class StorageUnavailableError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "StorageUnavailableError";
  }
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isBrowser()) {
      reject(new StorageUnavailableError("IndexedDB is not available in this environment"));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_RUN)) {
        db.createObjectStore(STORE_RUN);
      }
      if (!db.objectStoreNames.contains(STORE_CODEX)) {
        db.createObjectStore(STORE_CODEX, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new StorageUnavailableError("Failed to open IndexedDB", req.error));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new StorageUnavailableError("IndexedDB transaction failed", tx.error));
    tx.onabort = () => reject(new StorageUnavailableError("IndexedDB transaction aborted", tx.error));
  });
}

export async function putRun(value: unknown): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE_RUN, "readwrite");
  tx.objectStore(STORE_RUN).put(value, RUN_KEY);
  await txDone(tx);
  db.close();
}

export async function getRun<T = unknown>(): Promise<T | null> {
  const db = await openDb();
  const tx = db.transaction(STORE_RUN, "readonly");
  const result = await new Promise<T | null>((resolve, reject) => {
    const req = tx.objectStore(STORE_RUN).get(RUN_KEY);
    req.onsuccess = () => resolve((req.result as T) ?? null);
    req.onerror = () => reject(new StorageUnavailableError("IndexedDB read failed", req.error));
  });
  db.close();
  return result;
}

export async function clearRun(): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE_RUN, "readwrite");
  tx.objectStore(STORE_RUN).delete(RUN_KEY);
  await txDone(tx);
  db.close();
}

export async function appendCodexRecord(value: unknown): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE_CODEX, "readwrite");
  tx.objectStore(STORE_CODEX).add(value);
  await txDone(tx);
  db.close();
}

export async function listCodexRecords<T = unknown>(): Promise<T[]> {
  const db = await openDb();
  const tx = db.transaction(STORE_CODEX, "readonly");
  const result = await new Promise<T[]>((resolve, reject) => {
    const req = tx.objectStore(STORE_CODEX).getAll();
    req.onsuccess = () => resolve((req.result as T[]) ?? []);
    req.onerror = () => reject(new StorageUnavailableError("IndexedDB read failed", req.error));
  });
  db.close();
  return result;
}
