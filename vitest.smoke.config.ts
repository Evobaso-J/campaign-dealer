import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "~~": path.resolve(dirname, "."),
      "~": path.resolve(dirname, "app"),
    },
  },
  test: {
    include: ["server/tests/smoke.test.ts"],
    environment: "node",
    testTimeout: 120_000,
  },
});
