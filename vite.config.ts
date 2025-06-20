import { fileURLToPath, URL } from "node:url";

import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import handlebars from "vite-plugin-handlebars";

// https://vitejs.dev/config/
export default defineConfig({
  appType: "mpa",
  plugins: [
    vue(),
    handlebars({
      partialDirectory: resolve(__dirname, "src", "partials"),
    }),
  ],
  root: "htdocs",
  css: {
    preprocessorOptions: {
      less: {
        math: "always",
        relativeUrls: true,
        javascriptEnabled: true,
      },
    },
  },
  resolve: {
    alias: {
      "/src": resolve(process.cwd(), "src"),
      "@": fileURLToPath(new URL("../src", import.meta.url)),
      "@style": resolve(__dirname, "src", "style"),
      "@pages": resolve(__dirname, "src", "pages"),
      "@components": resolve(__dirname, "src", "components"),
      "@api": resolve(__dirname, "src", "api"),
    },
  },
  publicDir: "../public",
  assetsInclude: ["**/*.png"],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      external: [/^\/i\//, /^\/FUMBBL\//],
      input: {
        tournamentsquads: resolve(__dirname, "htdocs", "tournamentsquads.html"),
        winrater: resolve(__dirname, "htdocs", "winrater.html"),
        team: resolve(__dirname, "htdocs", "team.html"),
        boxtrophy: resolve(__dirname, "htdocs", "boxtrophy.html"),
        idt: resolve(__dirname, "htdocs", "idt.html"),
        statcentral: resolve(__dirname, "htdocs", "statcentral.html"),
      },
      output: {
        format: "esm",
        //entryFileNames: 'entries/[name].js',
        //chunkFileNames: 'chunks/[name].js',
        //assetFileNames: 'assets/[name].[ext]'
      },
    },
  },
});
