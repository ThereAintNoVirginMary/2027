import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { parseAccommodation, type Accommodation } from "./accommodations";
import { db } from "./firebase";
import { parsePerson, type Person } from "./person";
import { parseVehicle, type Vehicle } from "./vehicles";

export type DirectoryEntry = {
  uid: string;
  legalName: string;
  email: string;
};

export function useRegistration(uid: string, email: string) {
  const [person, setPerson] = useState<Person | null>(null);
  const [directory, setDirectory] = useState<DirectoryEntry[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubs = [
      onSnapshot(doc(db, "people", uid), (snap) => {
        setPerson(snap.exists() ? parsePerson(snap.data(), email) : null);
        setReady(true);
      }),
      onSnapshot(collection(db, "directory"), (snap) => {
        setDirectory(
          snap.docs
            .map((item) => {
              const data = item.data() as Record<string, unknown>;
              return {
                uid: item.id,
                legalName: typeof data.legalName === "string" ? data.legalName : "",
                email: typeof data.email === "string" ? data.email : "",
              };
            })
            .sort((a, b) => a.legalName.localeCompare(b.legalName)),
        );
      }),
      onSnapshot(collection(db, "accommodations"), (snap) => {
        setAccommodations(
          snap.docs.flatMap((item) => {
            const parsed = parseAccommodation(item.id, item.data());
            return parsed ? [parsed] : [];
          }),
        );
      }),
      onSnapshot(query(collection(db, "vehicles"), where("ownerUid", "==", uid)), (snap) => {
        setVehicles(
          snap.docs.flatMap((item) => {
            const parsed = parseVehicle(item.id, item.data());
            return parsed ? [parsed] : [];
          }),
        );
      }),
    ];
    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, [uid, email]);

  return { person, directory, accommodations, vehicles, ready };
}
