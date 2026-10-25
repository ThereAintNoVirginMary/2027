import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { doc, getDoc, setDoc } from "firebase/firestore";

let env: RulesTestEnvironment;

function person(email: string, extra: Record<string, unknown> = {}) {
  return {
    legalName: "Aurel Gruber",
    email,
    whatsapp: "+41 79 000 00 00",
    emergencyName: "Sam Hale",
    emergencyPhone: "+41 79 000 00 01",
    hasTicket: false,
    earlyBuild: false,
    lateTeardown: false,
    leadRoles: [],
    helpRoles: [],
    admin: false,
    ...extra,
  };
}

function authed(uid: string, email: string, verified = true) {
  return env.authenticatedContext(uid, { email, email_verified: verified });
}

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "thereaintnovirginmary2027",
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

beforeEach(async () => {
  await env.clearFirestore();
});

afterAll(async () => {
  await env.cleanup();
});

describe("camp registration rules", () => {
  it("rejects an unverified read", async () => {
    const db = authed("user", "user@example.com", false).firestore();
    await assertFails(getDoc(doc(db, "directory", "user")));
  });

  it("lets a member create their own profile and directory entry", async () => {
    const db = authed("user", "user@example.com").firestore();
    await assertSucceeds(setDoc(doc(db, "people", "user"), person("user@example.com")));
    await assertSucceeds(
      setDoc(doc(db, "directory", "user"), {
        legalName: "Aurel Gruber",
        email: "user@example.com",
      }),
    );
  });

  it("rejects a member appointing themselves admin", async () => {
    const db = authed("user", "user@example.com").firestore();
    await assertFails(
      setDoc(doc(db, "people", "user"), person("user@example.com", { admin: true })),
    );
  });

  it("hides another person's private record", async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "people", "other"), person("other@example.com"));
    });
    const db = authed("user", "user@example.com").firestore();
    await assertFails(getDoc(doc(db, "people", "other")));
  });

  it("lets an admin read the roster and appoint a lead", async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      const store = context.firestore();
      await setDoc(doc(store, "people", "admin"), person("admin@example.com", { admin: true }));
      await setDoc(doc(store, "people", "other"), person("other@example.com"));
    });
    const db = authed("admin", "admin@example.com").firestore();
    await assertSucceeds(getDoc(doc(db, "people", "other")));
    await assertSucceeds(setDoc(doc(db, "leads", "bar"), { uid: "other" }));
  });

  it("rejects a member appointing a lead", async () => {
    const db = authed("user", "user@example.com").firestore();
    await assertFails(setDoc(doc(db, "leads", "bar"), { uid: "user" }));
  });

  it("accepts an RV with a vehicle pass and rejects a trailer with one", async () => {
    const db = authed("user", "user@example.com").firestore();
    await assertSucceeds(
      setDoc(doc(db, "accommodations", "rv"), {
        ownerUid: "user",
        label: "White RV",
        type: "rv",
        lengthFt: 32,
        widthFt: 8,
        vehiclePass: true,
        occupantUids: ["user"],
      }),
    );
    await assertFails(
      setDoc(doc(db, "accommodations", "trailer"), {
        ownerUid: "user",
        label: "Cargo",
        type: "trailer",
        lengthFt: 12,
        widthFt: 6,
        vehiclePass: true,
        occupantUids: [],
      }),
    );
  });

  it("rejects a vehicle registered for someone else", async () => {
    const db = authed("user", "user@example.com").firestore();
    await assertFails(
      setDoc(doc(db, "vehicles", "truck"), {
        ownerUid: "other",
        label: "Tow truck",
        lengthFt: 22,
        widthFt: 8,
        hasPass: true,
      }),
    );
  });
});
