import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";

import { create } from "./src/plugin";

/** @type {import('vite').UserConfig} */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const base = env.VITE_APP_BASE_PATH || "/";

  return {
    plugins: [
      vue(),
      create({
        selector: "observed-module",
        basePath: base,
        fileName: "remote-config-test-observed-module.json",
        module: "observed-module",
        type: "observed",
      }),
      create(
        {
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
            "test-main": ["./src/test-main"],
            "test-file": ["./src/test-file"],
            "test-file-second": ["./src/test-file-2"],
          },
          format: "module",
        },
      },
    },
  };
});
