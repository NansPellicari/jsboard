/// <reference types="vite/client" />

import { resolve } from "path";
import externals from "rollup-plugin-node-externals";
import dts from "vite-plugin-dts";

import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    { ...externals(), enforce: "pre" },
    dts({
      include: ["src"],
      exclude: ["examples"],
    }),
  ],
  build: {
    minify: false,
    lib: {
      entry: resolve(__dirname, "src/jsboard.ts"),
      name: "JSBoard",
      fileName: "jsboard",
      formats: ["cjs"],
    },
  },
});
