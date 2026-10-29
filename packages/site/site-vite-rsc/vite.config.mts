import react from "@vitejs/plugin-react";
import preserveDirectives from "rollup-plugin-preserve-directives";
import { defineConfig } from "vite";
import dts from "unplugin-dts/vite";

export default defineConfig({
    plugins: [
        react(),
        dts({ tsconfigPath: "./tsconfig.build.json" }), // generates the types for the library
    ],
    build: {
        outDir: "lib",
        lib: {
            entry: {
                index: "./src/index.ts",
                "vite/index": "./src/vite/index.ts",
            },
            formats: ["es"],
        },
        rolldownOptions: {
            plugins: [preserveDirectives()], // is necessary to preserve "use client" at top of file
            // All npm packages are external, bundling them would mix server and client code
            external: (source) => !source.startsWith(".") && !source.startsWith("/"),
            output: {
                // Client components only work as separate modules
                preserveModules: true,
                preserveModulesRoot: "src",
                entryFileNames: "[name].js",
            },
        },
    },
});
