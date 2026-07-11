/* =========================================================================
   TECLA.EXE — camada de BANCO DE DADOS (IndexedDB)
   -------------------------------------------------------------------------
   O jogo continua 100% local e sem servidor (abre com duplo-clique no
   index.html). Só que agora, em vez de um único blob em localStorage, os
   dados ficam num banco de dados de verdade dentro do navegador
   (IndexedDB), organizado em "tabelas" (object stores):
     - users  → um registro por conta (chave: username)
     - meta   → dados gerais, como a sessão ativa

   Se por algum motivo o navegador não suportar/permitir IndexedDB (ex.:
   alguns navegadores bloqueiam ao abrir arquivo local com file://), o
   jogo cai automaticamente para localStorage, sem quebrar nada.
   ========================================================================= */

const TECLA_DB_NAME = "TeclaExeDB";
const TECLA_DB_VERSION = 1;
const STORE_USERS = "users";
const STORE_META = "meta";

const FALLBACK_USERS_KEY = "tecla_exe_fallback_users_v1";
const FALLBACK_SESSION_KEY = "tecla_exe_fallback_session_v1";

let _dbPromise = null;
let _usingFallback = false;

function openDatabase() {
  if (_dbPromise) return _dbPromise;

  _dbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      _usingFallback = true;
      reject(new Error("IndexedDB indisponível neste navegador."));
      return;
    }
    let req;
    try {
      req = indexedDB.open(TECLA_DB_NAME, TECLA_DB_VERSION);
    } catch (err) {
      _usingFallback = true;
      reject(err);
      return;
    }

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_USERS)) {
        db.createObjectStore(STORE_USERS, { keyPath: "username" });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "key" });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => {
      _usingFallback = true;
      reject(req.error || new Error("Falha ao abrir o banco de dados."));
    };
    req.onblocked = () => {
      _usingFallback = true;
      reject(new Error("Abertura do banco de dados bloqueada."));
    };
  });

  return _dbPromise;
}

function isUsingFallback() {
  return _usingFallback;
}

/* ---------------------------------------------------------------------
   USUÁRIOS
--------------------------------------------------------------------- */
async function dbLoadAllUsers() {
  try {
    const db = await openDatabase();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_USERS, "readonly");
      const store = tx.objectStore(STORE_USERS);
      const req = store.getAll();
      req.onsuccess = () => {
        const map = {};
        (req.result || []).forEach(rec => { map[rec.username] = rec; });
        resolve(map);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    _usingFallback = true;
    return fallbackLoadAllUsers();
  }
}

async function dbSaveUser(username, userRecord) {
  const record = { ...userRecord, username };
  try {
    const db = await openDatabase();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_USERS, "readwrite");
      tx.objectStore(STORE_USERS).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    _usingFallback = true;
    fallbackSaveUser(username, record);
  }
}

/* ---------------------------------------------------------------------
   SESSÃO (meta)
--------------------------------------------------------------------- */
async function dbGetSession() {
  try {
    const db = await openDatabase();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_META, "readonly");
      const req = tx.objectStore(STORE_META).get("session");
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    _usingFallback = true;
    return localStorage.getItem(FALLBACK_SESSION_KEY);
  }
}

async function dbSetSession(username) {
  try {
    const db = await openDatabase();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_META, "readwrite");
      const store = tx.objectStore(STORE_META);
      if (username) store.put({ key: "session", value: username });
      else store.delete("session");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    _usingFallback = true;
    if (username) localStorage.setItem(FALLBACK_SESSION_KEY, username);
    else localStorage.removeItem(FALLBACK_SESSION_KEY);
  }
}

/* ---------------------------------------------------------------------
   FALLBACK — localStorage (só entra em ação se IndexedDB falhar)
--------------------------------------------------------------------- */
function fallbackLoadAllUsers() {
  try {
    const raw = localStorage.getItem(FALLBACK_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}
function fallbackSaveUser(username, record) {
  const all = fallbackLoadAllUsers();
  all[username] = record;
  localStorage.setItem(FALLBACK_USERS_KEY, JSON.stringify(all));
}
