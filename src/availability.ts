import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { persist } from "./save-notice";

export async function saveAvailability(
  uid: string,
  earlyBuild: boolean,
  lateTeardown: boolean,
): Promise<void> {
  await persist(() => updateDoc(doc(db, "people", uid), { earlyBuild, lateTeardown }));
}
