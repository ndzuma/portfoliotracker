import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "edge-runtime",
    globals: true,
    include: ["convex/**/*.test.ts"],
    exclude: ["node_modules", "dist", ".next"],
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    server: {
      deps: {
        inline: ["convex-test"],
      },
    },
  },
});
