import react from "@vitejs/plugin-react";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react(), dts({ tsconfigPath: "./tsconfig.build.json" })],
    build: {
        outDir: "lib",
        lib: {
            entry: {
                index: "./src/index.ts",
                server: "./src/server.ts",
                node: "./src/node.ts",
                vite: "./src/vite.ts",
            },
            formats: ["es"],
            cssFileName: "style",
        },
        rolldownOptions: {
            // All npm packages, including @dextinity/site-react, stay external so that the site's bundler resolves a single instance of them in each environment.
            // Only the CSS of @dextinity/site-react is included in style.css, so that a site imports a single stylesheet.
            external: (source) => !source.startsWith(".") && !source.startsWith("/") && source !== "@dextinity/site-react/css",
            output: {
                // A module per source file, so that the client components keep their own "use client" module
                preserveModules: true,
                preserveModulesRoot: "src",
                entryFileNames: "[name].js",
            },
        },
        minify: false,
    },
});
