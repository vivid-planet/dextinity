import { defineConfig } from "vite";

export default defineConfig({
    build: {
        outDir: "lib",
        emptyOutDir: false,
        minify: false,
        lib: {
            entry: "./src/index.ts",
            formats: ["es"],
        },
        rolldownOptions: {
            external: (source) => !source.startsWith(".") && !source.startsWith("/"),
            output: {
                preserveModules: true,
                preserveModulesRoot: "src",
                entryFileNames: "[name].js",
            },
        },
    },
});
