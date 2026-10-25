import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Unit tests only — no emulator required.
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
