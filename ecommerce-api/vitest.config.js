import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["src/__tests__/setup.integration.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: ["node_modules/", "src/__tests__/", "coverage/", "**/*.test.js"],
    },
    include: ["src/**/__tests__/**/*.test.js"],
    exclude: ["node_modules/", "dist/"],
  },
});
