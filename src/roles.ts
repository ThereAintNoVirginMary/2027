import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { persist } from "./save-notice";

const ROLE_COPY = {
  floorplan: [
    "Floorplan",
    "Mapping camp layout: Container, vehicle, RV, tent, fire lane and other infrastructure placement.",
  ],
  container: [
    "Container shipping coordination",
    "Coordinating transportation of the camp container to and from the playa.",
  ],
  procurement: [
    "Procurement",
    "Sourcing and purchasing materials, equipment, and supplies for camp.",
  ],
  build: ["Build coordination", "Organizing and leading the crew responsible for camp setup."],
  strike: [
    "Strike coordination",
    "Organizing and leading the crew responsible for camp teardown and cleanup.",
  ],
  art: ["Art", "Bringing and contributing an art installation or artwork to the playa."],
  artcar: ["Art car", "Providing an art car for the camp or playa experience."],
  burlesque: ["Burlesque show", "Producing and coordinating the camp's burlesque show."],
  bar: [
    "Bar",
    "Coordinating the Bloody Mary and Old Fashioned bar, including setup, supplies, and service.",
  ],
  sound: ["Sound", "Managing the sound system, speakers, cabling, and audio setup."],
  "live-music": ["Live music", "Coordinating bands, performers, and live music sets."],
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
  return role in ROLE_COPY ? ROLE_COPY[role as keyof typeof ROLE_COPY][0] : role;
}

export async function saveWillingness(
  uid: string,
  leadRoles: LeadRole[],
  helpRoles: HelpRole[],
): Promise<void> {
  await persist(() => updateDoc(doc(db, "people", uid), { leadRoles, helpRoles }));
}
