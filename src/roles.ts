import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { persist } from "./save-notice";

const ROLE_COPY = {
  floorplan: ["Floorplan", "Where every place and vehicle sits on the lot"],
  container: [
    "Container shipping coordination",
    "Getting the camp container to the playa and back",
  ],
  procurement: ["Procurement", "Buying the materials and supplies camp needs"],
  build: ["Build coordination", "Running the crew that puts camp up"],
  strike: ["Strike coordination", "Running the crew that takes camp down"],
  art: ["Art", "The installation placed out on the open playa"],
  artcar: ["Art car", "The art car and what it needs from camp"],
  burlesque: ["Burlesque show", "The burlesque show"],
  bar: ["Bar", "The Bloody Mary and Old Fashioned bar"],
  sound: ["Sound", "Speakers, cables, and the mix"],
  "live-music": ["Live music", "The bands and the sets"],
} as const;

export const LEAD_ROLES = [
  ["floorplan", ...ROLE_COPY.floorplan],
  ["container", ...ROLE_COPY.container],
  ["procurement", ...ROLE_COPY.procurement],
  ["build", ...ROLE_COPY.build],
  ["strike", ...ROLE_COPY.strike],
  ["art", ...ROLE_COPY.art],
  ["artcar", ...ROLE_COPY.artcar],
  ["burlesque", ...ROLE_COPY.burlesque],
  ["bar", ...ROLE_COPY.bar],
  ["sound", ...ROLE_COPY.sound],
  ["live-music", ...ROLE_COPY["live-music"]],
] as const;

export const HELP_ROLES = [
  ["floorplan", ...ROLE_COPY.floorplan],
  ["container", ...ROLE_COPY.container],
  ["procurement", ...ROLE_COPY.procurement],
  ["art", ...ROLE_COPY.art],
  ["artcar", ...ROLE_COPY.artcar],
  ["burlesque", ...ROLE_COPY.burlesque],
  ["bar", ...ROLE_COPY.bar],
  ["sound", ...ROLE_COPY.sound],
  ["live-music", ...ROLE_COPY["live-music"]],
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
