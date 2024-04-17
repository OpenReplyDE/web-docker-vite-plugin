import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";

import { create } from "./src/plugin";
import * as path from "path";

/** @type {import('vite').UserConfig} */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const base = env.VITE_APP_BASE_PATH || "/";

  return {
    plugins: [
      vue(),
      create({
        entry: path.resolve(__dirname, "./src/test-main.ts"),
        selector: "observed-module",
        basePath: base,
        fileName: "remote-config-test-observed-module.json",
        module: "observed-module",
        type: "observed",
      }),
      create(
        {
          entry: path.resolve(__dirname, "./src/test-main.ts"),
          basePath: base,
          pages: [".*"],
          fileName: "remote-config-test-page-module.json",
          module: "page-module",
          type: "page",
        }
      ),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "test-file": ["./src/test-file"],
            "test-file-second": ["./src/test-file-2"],
          },
          format: "module",
        },
      },
    },
  };
});
