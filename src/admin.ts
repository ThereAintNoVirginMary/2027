import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { type LeadRole } from "./roles";
import { persist } from "./save-notice";

export async function appointLead(role: LeadRole, uid: string): Promise<void> {
  await persist(() => setDoc(doc(db, "leads", role), { uid }));
}

export async function clearLead(role: LeadRole): Promise<void> {
  await persist(() => deleteDoc(doc(db, "leads", role)));
}
