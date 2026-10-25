import { deleteDoc, doc, runTransaction, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const ACCOMMODATION_TYPES = [
  ["rv", "RV (requires vehicle pass)"],
  ["trailer", "Trailer"],
  ["yurt", "Yurt"],
  ["shiftpod", "Shiftpod"],
] as const;

export type AccommodationType = (typeof ACCOMMODATION_TYPES)[number][0];

export type Accommodation = {
  id: string;
  ownerUid: string;
  label: string;
  type: AccommodationType;
  lengthFt: number;
  widthFt: number;
  vehiclePass: boolean;
  occupantUids: string[];
};

export class OccupantTakenError extends Error {
  constructor(readonly uid: string) {
    super("That person already sleeps in another place.");
    this.name = "OccupantTakenError";
  }
}

function isType(value: unknown): value is AccommodationType {
  return ACCOMMODATION_TYPES.some(([type]) => type === value);
}

export function accommodationError(input: {
  label: string;
  type: AccommodationType;
  lengthFt: number;
  widthFt: number;
  vehiclePass: boolean;
}): string | null {
  if (input.label.trim() === "") return "Name this place.";
  if (!Number.isFinite(input.lengthFt) || input.lengthFt <= 0 || input.lengthFt > 80) {
    return "Length must be a number of feet, greater than 0.";
  }
  if (!Number.isFinite(input.widthFt) || input.widthFt <= 0 || input.widthFt > 80) {
    return "Width must be a number of feet, greater than 0.";
  }
  if (input.type !== "rv" && input.vehiclePass) {
    return "Only an RV takes a vehicle pass.";
  }
  return null;
}

export function parseAccommodation(id: string, value: unknown): Accommodation | null {
  if (typeof value !== "object" || value === null) return null;
  const data = value as Record<string, unknown>;
  if (
    typeof data.ownerUid !== "string" ||
    typeof data.label !== "string" ||
    !isType(data.type) ||
    typeof data.lengthFt !== "number" ||
    typeof data.widthFt !== "number" ||
    typeof data.vehiclePass !== "boolean" ||
    !Array.isArray(data.occupantUids)
  ) {
    return null;
  }
  const occupantUids = data.occupantUids.filter((uid): uid is string => typeof uid === "string");
  return {
    id,
    ownerUid: data.ownerUid,
    label: data.label,
    type: data.type,
    lengthFt: data.lengthFt,
    widthFt: data.widthFt,
    vehiclePass: data.vehiclePass,
    occupantUids,
  };
}

function stored(acc: Accommodation) {
  return {
    ownerUid: acc.ownerUid,
    label: acc.label.trim(),
    type: acc.type,
    lengthFt: acc.lengthFt,
    widthFt: acc.widthFt,
    vehiclePass: acc.type === "rv" ? acc.vehiclePass : false,
    occupantUids: acc.occupantUids,
  };
}

export async function saveAccommodation(
  next: Accommodation,
  previous: Accommodation | null,
): Promise<void> {
  const error = accommodationError(next);
  if (error) throw new Error(error);
  const ref = doc(db, "accommodations", next.id);
  await setDoc(ref, stored(next));
  const before = previous?.occupantUids ?? [];
  const added = next.occupantUids.filter((uid) => !before.includes(uid));
  const removed = before.filter((uid) => !next.occupantUids.includes(uid));
  try {
    await runTransaction(db, async (tx) => {
      for (const uid of added) {
        const occRef = doc(db, "occupancy", uid);
        const occ = await tx.get(occRef);
        const raw: unknown = occ.data();
        const current =
          typeof raw === "object" &&
          raw !== null &&
          "accommodationId" in raw &&
          typeof raw.accommodationId === "string"
            ? raw.accommodationId
            : undefined;
        if (occ.exists() && current !== next.id) throw new OccupantTakenError(uid);
        tx.set(occRef, { accommodationId: next.id });
      }
      for (const uid of removed) tx.delete(doc(db, "occupancy", uid));
    });
  } catch (error) {
    if (previous) await setDoc(ref, stored(previous));
    else await deleteDoc(ref);
    throw error;
  }
}

export async function deleteAccommodation(acc: Accommodation): Promise<void> {
  await runTransaction(db, (tx) => {
    for (const uid of acc.occupantUids) tx.delete(doc(db, "occupancy", uid));
    tx.delete(doc(db, "accommodations", acc.id));
    return Promise.resolve();
  });
}
