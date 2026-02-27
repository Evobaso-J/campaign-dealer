import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";

const dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          alias: {
            "~~": path.resolve(dirname, "."),
            "~": path.resolve(dirname, "app"),
          },
        },
        test: {
          name: "unit",
          include: ["test/unit/**/*.{test,spec}.ts"],
          environment: "node",
        },
      },
      await defineVitestProject({
        test: {
          name: "nuxt",
          include: ["test/nuxt/**/*.{test,spec}.ts"],
          environment: "nuxt",
        },
      }),
      {
        resolve: {
          alias: {
            "~~": path.resolve(dirname, "."),
            "~": path.resolve(dirname, "app"),
          },
        },
        test: {
          name: "server",
          include: ["server/**/*.{test,spec}.ts"],
          exclude: ["server/tests/smoke.test.ts"],
          environment: "node",
        },
      },
    ],
  },
});
