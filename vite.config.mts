﻿import nodeExternals from "rollup-plugin-node-externals";
import { defineConfig } from "vite";
import type { LibraryFormats } from "vite";

export default defineConfig(() => {
  return {
    plugins: [nodeExternals({ builtins: true, deps: false })],
    build: {
      rollupOptions: {
        external: ["vscode"],
        treeshake: {
          moduleSideEffects: false,
        },
      },
      lib: {
        entry: "src/extension.ts",
        formats: ["cjs"] satisfies LibraryFormats[],
        fileName: () => "extension.js",
      },
      outDir: "dist",
    },
  };
});
