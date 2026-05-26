import Dexie from "dexie";

export const db = new Dexie("VeloDB");
db.version(1).stores({ stateParams: "++id, stateParameter, value" });
