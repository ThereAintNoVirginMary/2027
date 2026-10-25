import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Firestore emulator tests — run inside `firebase emulators:exec`.
    include: ["firestore/**/*.test.ts"],
    environment: "node",
  },
});
