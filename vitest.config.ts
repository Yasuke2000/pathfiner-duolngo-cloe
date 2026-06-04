import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // The engine is framework-agnostic pure TypeScript; we test it in a plain node env.
    environment: "node",
    include: ["src/engine/**/*.test.ts"],
  },
});
