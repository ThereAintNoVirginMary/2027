import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { persist } from "./save-notice";

export const LEAD_ROLES = [
  ["floorplan", "Floorplan"],
  ["container", "Container shipping coordination"],
  ["procurement", "Procurement"],
  ["build", "Build coordination"],
  ["strike", "Strike coordination"],
  ["art", "Art"],
  ["artcar", "Art car"],
  ["burlesque", "Burlesque show"],
  ["bar", "Bar"],
  ["sound", "Sound"],
  ["live-music", "Live music"],
] as const;

export const HELP_ROLES = [
  ["floorplan", "Floorplan"],
  ["container", "Container shipping coordination"],
  ["procurement", "Procurement"],
  ["art", "Art"],
  ["artcar", "Art car"],
  ["burlesque", "Burlesque show"],
  ["bar", "Bar"],
  ["sound", "Sound"],
  ["live-music", "Live music"],
] as const;

export type LeadRole = (typeof LEAD_ROLES)[number][0];
export type HelpRole = (typeof HELP_ROLES)[number][0];

const leadIds: readonly string[] = LEAD_ROLES.map(([id]) => id);
const helpIds: readonly string[] = HELP_ROLES.map(([id]) => id);

export function isLeadRole(role: string): role is LeadRole {
  return leadIds.includes(role);
}

export function isHelpRole(role: string): role is HelpRole {
  return helpIds.includes(role);
}

export function leadLabel(role: string): string {
  return LEAD_ROLES.find(([id]) => id === role)?.[1] ?? role;
}

export async function saveWillingness(
  uid: string,
  leadRoles: LeadRole[],
  helpRoles: HelpRole[],
): Promise<void> {
  await persist(() => updateDoc(doc(db, "people", uid), { leadRoles, helpRoles }));
}
