import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { type AppointedRole } from "./roles";
import { persist } from "./save-notice";

export async function appointLead(role: AppointedRole, uid: string): Promise<void> {
  await persist(() => setDoc(doc(db, "leads", role), { uid }));
}

export async function clearLead(role: AppointedRole): Promise<void> {
  await persist(() => deleteDoc(doc(db, "leads", role)));
}
