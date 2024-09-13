import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/lib/index.ts"),
      name: "charseq",
      fileName: "charseq",
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
    copyPublicDir: false,
  },
});
