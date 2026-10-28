import { defineConfig } from "vite";

import { generateScopedName } from "./src/cssModules/generateScopedName";

export default defineConfig({
    css: {
        modules: {
            generateScopedName,
        },
    },
    build: {
        outDir: "lib",
        emptyOutDir: false,
        minify: false,
        lib: {
            entry: "./src/index.ts",
            formats: ["es"],
            cssFileName: "style",
        },
        rollupOptions: {
            external: (source) => !source.startsWith(".") && !source.startsWith("/"),
            output: {
                preserveModules: true,
                preserveModulesRoot: "src",
                entryFileNames: "[name].js",
            },
        },
    },
});
