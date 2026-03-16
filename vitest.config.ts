import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    env: {
      PUBLIC_API_URL: "http://localhost/api",
    },
  },
});
