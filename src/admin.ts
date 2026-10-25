import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { type LeadRole } from "./roles";

export async function appointLead(role: LeadRole, uid: string): Promise<void> {
  await setDoc(doc(db, "leads", role), { uid });
}

export async function clearLead(role: LeadRole): Promise<void> {
  await deleteDoc(doc(db, "leads", role));
}
