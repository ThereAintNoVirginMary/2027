import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export type Vehicle = {
  id: string;
  ownerUid: string;
  label: string;
  lengthFt: number;
  widthFt: number;
  hasPass: boolean;
};

export function vehicleError(input: {
  label: string;
  lengthFt: number;
  widthFt: number;
}): string | null {
  if (input.label.trim() === "") return "Name this vehicle.";
  if (!Number.isFinite(input.lengthFt) || input.lengthFt <= 0 || input.lengthFt > 80) {
    return "Length must be a number of feet, greater than 0.";
  }
  if (!Number.isFinite(input.widthFt) || input.widthFt <= 0 || input.widthFt > 80) {
    return "Width must be a number of feet, greater than 0.";
  }
  return null;
}

export function parseVehicle(id: string, value: unknown): Vehicle | null {
  if (typeof value !== "object" || value === null) return null;
  const data = value as Record<string, unknown>;
  if (
    typeof data.ownerUid !== "string" ||
    typeof data.label !== "string" ||
    typeof data.lengthFt !== "number" ||
    typeof data.widthFt !== "number" ||
    typeof data.hasPass !== "boolean"
  ) {
    return null;
  }
  return {
    id,
    ownerUid: data.ownerUid,
    label: data.label,
    lengthFt: data.lengthFt,
    widthFt: data.widthFt,
    hasPass: data.hasPass,
  };
}

export async function saveVehicle(vehicle: Vehicle): Promise<void> {
  const error = vehicleError(vehicle);
  if (error) throw new Error(error);
  await setDoc(doc(db, "vehicles", vehicle.id), {
    ownerUid: vehicle.ownerUid,
    label: vehicle.label.trim(),
    lengthFt: vehicle.lengthFt,
    widthFt: vehicle.widthFt,
    hasPass: vehicle.hasPass,
  });
}

export async function deleteVehicle(id: string): Promise<void> {
  await deleteDoc(doc(db, "vehicles", id));
}
