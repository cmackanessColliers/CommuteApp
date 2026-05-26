import Dexie from "dexie";

export const db = new Dexie("app-state-store");
db.version(1).stores({ stateParams: "++id, stateParameter, value" });
