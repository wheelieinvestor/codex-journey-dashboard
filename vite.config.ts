import { defineConfig } from "vite";
export default defineConfig({ test: { environment: "node", exclude: ["tests/e2e/**", "node_modules/**", "dist/**"] } });
