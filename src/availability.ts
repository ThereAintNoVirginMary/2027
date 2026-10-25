import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function saveAvailability(
  uid: string,
  earlyBuild: boolean,
  lateTeardown: boolean,
): Promise<void> {
  await updateDoc(doc(db, "people", uid), { earlyBuild, lateTeardown });
}
