import Dexie from "https://cdn.jsdelivr.net/npm/dexie@3.2.4/+esm";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

const auth = getAuth();
const firestore = getFirestore();

const memoryStore = {
  player: null,
  lastSaved: 0,
};

const db = new Dexie("PlayerDataDB");
db.version(1).stores({
  playerData: "&id, data, lastUpdated"
});

function getCurrentUserId() {
  const user = auth.currentUser;
  return user?.uid || null;
}

function createDefaultPlayer(id) {
  return {
    id,
    score: 0,
    level: 1,
    coins: 0,
    unspentPoints: 5,
    attributes: {
      strength: 0,
      agility: 0,
      intelligence: 0
    },
    financeData: {},
    avatarData: {},
    heroData: {},
    lastUpdated: Date.now()
  };
}

function deepMerge(target, updates) {
  for (const key in updates) {
    if (
      typeof updates[key] === "object" &&
      updates[key] !== null &&
      !Array.isArray(updates[key])
    ) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], updates[key]);
    } else {
      target[key] = updates[key];
    }
  }
  return target;
}

const playerDataManager = (() => {
  let syncInterval = null;
  const syncFrequencyMs = 30000;

  async function init(playerId = null) {
    if (!playerId) {
      playerId = getCurrentUserId();
      if (!playerId) throw new Error("No player ID or authenticated user found.");
    }

    const local = await db.playerData.get(playerId);
    if (local) {
      memoryStore.player = local;
    } else {
      const docRef = doc(firestore, "players", playerId);
      const userDoc = await getDoc(docRef);

      if (userDoc.exists()) {
        memoryStore.player = userDoc.data();
        await db.playerData.put({ ...memoryStore.player, id: playerId });
      } else {
        memoryStore.player = createDefaultPlayer(playerId);
        await db.playerData.put(memoryStore.player);
        await setDoc(docRef, memoryStore.player);
      }
    }

    startAutoSync();
    return memoryStore.player;
  }

  function get() {
    return memoryStore.player;
  }

  function update(updates = {}, replace = false) {
    if (!memoryStore.player) return;
    if (replace) {
      memoryStore.player = { ...updates, lastUpdated: Date.now() };
    } else {
      deepMerge(memoryStore.player, updates);
      memoryStore.player.lastUpdated = Date.now();
    }
  }

  function updateByKey(path, value) {
    if (!memoryStore.player) return;

    const keys = path.split(".");
    let obj = memoryStore.player;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }

    obj[keys[keys.length - 1]] = value;
    memoryStore.player.lastUpdated = Date.now();
  }

  async function save() {
    if (!memoryStore.player) return;
    const id = memoryStore.player.id;
    await db.playerData.put(memoryStore.player);
    await setDoc(doc(firestore, "players", id), memoryStore.player);
  }

  async function forceLoadFromCloud(playerId = null) {
    if (!playerId) {
      playerId = getCurrentUserId();
      if (!playerId) throw new Error("No player ID or authenticated user found.");
    }

    const docRef = doc(firestore, "players", playerId);
    const userDoc = await getDoc(docRef);

    if (userDoc.exists()) {
      memoryStore.player = userDoc.data();
      await db.playerData.put({ ...memoryStore.player, id: playerId });
      return memoryStore.player;
    }

    return null;
  }

  function startAutoSync() {
    stopAutoSync();
    syncInterval = setInterval(() => {
      save();
    }, syncFrequencyMs);
  }

  function stopAutoSync() {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  }

  async function clearAll() {
    await db.playerData.clear();
    memoryStore.player = null;
  }

  return {
    init,
    get,
    update,
    updateByKey,
    save,
    clearAll,
    forceLoadFromCloud,
    startAutoSync,
    stopAutoSync
  };
})();

export default playerDataManager;




// Legacy Non-IndexDB
// const PlayerDataManager = (() => {
//   let data = {};
//   let firestoreDocRef = null;
//   let syncInterval = null;

//   // --- PUBLIC METHODS ---

//   async function init({ firestoreRef = null, defaultData = {}, autoSyncIntervalMs = 30000 }) {
//     firestoreDocRef = firestoreRef;

//     // 1. Load from Firestore if available
//     if (firestoreDocRef) {
//       try {
//         const doc = await firestoreDocRef.get();
//         if (doc.exists) {
//           data = doc.data();
//           console.log("Loaded data from Firestore");
//         }
//       } catch (err) {
//         console.warn("Error loading Firestore, falling back:", err);
//       }
//     }

//     // 2. Load from localStorage if Firestore unavailable or missing
//     if (Object.keys(data).length === 0) {
//       const local = localStorage.getItem("playerData");
//       if (local) {
//         data = JSON.parse(local);
//         console.log("Loaded data from localStorage");
//       }
//     }

//     // 3. Apply defaults if no data found
//     if (Object.keys(data).length === 0) {
//       data = { ...defaultData };
//       console.log("Using default player data");
//     }

//     // Start auto sync
//     if (autoSyncIntervalMs) {
//       syncInterval = setInterval(() => {
//         localStorage.setItem("playerData", JSON.stringify(data));
//         if (firestoreDocRef) {
//           firestoreDocRef.set(data, { merge: true });
//         }
//       }, autoSyncIntervalMs);
//     }
//   }

//   function get(key) {
//     return data[key];
//   }

//   function set(key, value) {
//     data[key] = value;
//     localStorage.setItem("playerData", JSON.stringify(data));
//   }

//   function bulkSet(newValues) {
//     Object.assign(data, newValues);
//     localStorage.setItem("playerData", JSON.stringify(data));
//   }

//   function all() {
//     return { ...data };
//   }

//   function clear() {
//     data = {};
//     localStorage.removeItem("playerData");
//     if (firestoreDocRef) {
//       firestoreDocRef.delete();
//     }
//   }

//   async function syncNow() {
//     localStorage.setItem("playerData", JSON.stringify(data));
//     if (firestoreDocRef) {
//       await firestoreDocRef.set(data, { merge: true });
//     }
//   }

//   function stopAutoSync() {
//     clearInterval(syncInterval);
//   }

//   // --- EXPOSE PUBLIC API ---
//   return {
//     init,
//     get,
//     set,
//     bulkSet,
//     all,
//     clear,
//     syncNow,
//     stopAutoSync,
//   };
// })();
