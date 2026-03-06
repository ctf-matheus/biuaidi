import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Restrict to only the prompts/ directory and dashboard/ itself (SEC-05)
      allow: [path.resolve(__dirname, "../prompts"), __dirname],
    },
  },
  resolve: {
    alias: {
      "@prompts": path.resolve(__dirname, "../prompts"),
    },
  },
});
