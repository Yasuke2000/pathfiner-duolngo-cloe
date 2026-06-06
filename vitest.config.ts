import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // The engine/game/content modules are framework-agnostic TypeScript; we test
    // them in a plain node env.
    environment: "node",
    include: ["src/engine/**/*.test.ts", "src/content/**/*.test.ts", "src/game/**/*.test.ts"],
  },
});
