import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { create } from "./src/plugin";
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const base = env.VITE_APP_BASE_PATH || "/";
  return {
    plugins: [
      vue(),
      create({
        basePath: base,
        fileName: "vue-module.json",
        module: "vue-module",
        type: "page",
        pages: [".*"],
        scope: "webdocker",
        exposes: {
          vue: "vue-module",
          "exportedLocalFunction": "exported-local-function",
        },
      }),
    ],
    build: {
      lib: {
        entry: resolve(__dirname, "src/global-test.ts"),
        name: "Vue",
        fileName: "vue",
        formats: ["es"],
      },
      outDir: "dist",
    },
  };
});
