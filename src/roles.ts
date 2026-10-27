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
  utilities: [
    "Fuel, water, and sanitation",
    "Scheduling fuel and water delivery, and sanitation pickup for camp.",
  ],
} as const;

export const LEAD_ROLES = [
  ["floorplan", ...ROLE_COPY.floorplan],
  ["container", ...ROLE_COPY.container],
  ["procurement", ...ROLE_COPY.procurement],
  ["utilities", ...ROLE_COPY.utilities],
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
  ["container", ROLE_COPY.container[0], "Helping move the camp container to and from the playa."],
  [
    "procurement",
    ROLE_COPY.procurement[0],
    "Helping source and buy materials, equipment, and supplies for camp.",
  ],
  [
    "art",
    ROLE_COPY.art[0],
    "Helping with an art installation or artwork on the playa, after checking with its leads.",
  ],
  ["artcar", ROLE_COPY.artcar[0], "Helping with an art car, after checking with its owner."],
  ["burlesque", ROLE_COPY.burlesque[0], "Helping produce the camp's burlesque show."],
  [
    "bar",
    ROLE_COPY.bar[0],
    "Helping with the Bloody Mary and Old Fashioned bar, including setup, supplies, and service.",
  ],
  [
    "sound",
    ROLE_COPY.sound[0],
    "Helping with the sound system, speakers, cabling, and audio setup.",
  ],
  [
    "live-music",
    ROLE_COPY["live-music"][0],
    "Helping with bands, performers, and live music sets.",
  ],
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
