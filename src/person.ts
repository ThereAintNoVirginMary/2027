import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { persist } from "./save-notice";
import { type HelpRole, type LeadRole, isHelpRole, isLeadRole } from "./roles";

export type Person = {
  legalName: string;
  email: string;
  whatsapp: string;
  emergencyName: string;
  emergencyPhone: string;
  hasTicket: boolean;
  earlyBuild: boolean;
  lateTeardown: boolean;
  leadRoles: LeadRole[];
  helpRoles: HelpRole[];
  admin: boolean;
};

export function emptyPerson(email: string): Person {
  return {
    legalName: "",
    email,
    whatsapp: "",
    emergencyName: "",
    emergencyPhone: "",
    hasTicket: false,
    earlyBuild: false,
    lateTeardown: false,
    leadRoles: [],
    helpRoles: [],
    admin: false,
  };
}

function whatsappOk(value: string): boolean {
  const number = value.trim();
  const digits = number.replace(/\D/g, "");
  return /^\+[1-9][\d\s-]*$/.test(number) && digits.length >= 8 && digits.length <= 15;
}

export function personError(person: Person): string | null {
  if (person.legalName.trim() === "") return "Enter your legal name.";
  if (person.whatsapp.trim() === "") return "Enter your WhatsApp number.";
  if (!whatsappOk(person.whatsapp)) {
    return "Start your WhatsApp number with the country code, like +41 79 000 00 00.";
  }
  if (person.emergencyName.trim() === "") return "Enter an emergency contact.";
  if (person.emergencyPhone.trim() === "") return "Enter an emergency phone number.";
  return null;
}

function roleList<T extends string>(value: unknown, keep: (role: string) => role is T): T[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is T => typeof item === "string" && keep(item));
}

export function parsePerson(value: unknown, email: string): Person {
  if (typeof value !== "object" || value === null) return emptyPerson(email);
  const data = value as Record<string, unknown>;
  return {
    legalName: typeof data.legalName === "string" ? data.legalName : "",
    email,
    whatsapp: typeof data.whatsapp === "string" ? data.whatsapp : "",
    emergencyName: typeof data.emergencyName === "string" ? data.emergencyName : "",
    emergencyPhone: typeof data.emergencyPhone === "string" ? data.emergencyPhone : "",
    hasTicket: data.hasTicket === true,
    earlyBuild: data.earlyBuild === true,
    lateTeardown: data.lateTeardown === true,
    leadRoles: roleList(data.leadRoles, isLeadRole),
    helpRoles: roleList(data.helpRoles, isHelpRole),
    admin: data.admin === true,
  };
}

export async function savePerson(uid: string, person: Person): Promise<void> {
  const error = personError(person);
  if (error) throw new Error(error);
  const stored = {
    legalName: person.legalName.trim(),
    email: person.email,
    whatsapp: person.whatsapp.trim(),
    emergencyName: person.emergencyName.trim(),
    emergencyPhone: person.emergencyPhone.trim(),
    hasTicket: person.hasTicket,
    earlyBuild: person.earlyBuild,
    lateTeardown: person.lateTeardown,
    leadRoles: person.leadRoles,
    helpRoles: person.helpRoles,
    admin: person.admin,
  };
  await persist(async () => {
    await setDoc(doc(db, "people", uid), stored);
    await setDoc(doc(db, "directory", uid), {
      legalName: stored.legalName,
      email: stored.email,
    });
  });
}
