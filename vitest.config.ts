import path from "node:path";
import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";

export default defineConfig({
  test: {
    projects: [
      {
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
            "~~": path.resolve(__dirname, "."),
            "~": path.resolve(__dirname, "app"),
          },
        },
        test: {
          name: "server",
          include: ["server/**/*.{test,spec}.ts"],
          environment: "node",
        },
      },
    ],
  },
});
