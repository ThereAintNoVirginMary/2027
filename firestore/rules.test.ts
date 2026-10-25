import {
  assertFails,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { afterAll, beforeAll, describe, it } from "vitest";
import { doc, getDoc, setDoc } from "firebase/firestore";

let env: RulesTestEnvironment;

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

afterAll(async () => {
  await env.cleanup();
});

describe("deny-all baseline", () => {
  it("rejects an unauthenticated read", async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "people", "test")));
  });

  it("rejects an authenticated read", async () => {
    const db = env.authenticatedContext("uid-1").firestore();
    await assertFails(getDoc(doc(db, "people", "test")));
  });

  it("rejects an unauthenticated write", async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(db, "people", "test"), { name: "Alice" }));
  });

  it("rejects an authenticated write", async () => {
    const db = env.authenticatedContext("uid-1").firestore();
    await assertFails(setDoc(doc(db, "people", "uid-1"), { name: "Alice" }));
  });
});
