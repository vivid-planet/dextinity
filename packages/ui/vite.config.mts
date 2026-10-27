import { defineConfig, type Plugin } from "vite";

import { generateScopedName } from "./src/cssModules/generateScopedName";

const viteIgnoreComment = "/* @vite-ignore */";

// Library mode inlines every asset as a `data:` URL, which `<use>` refuses. This plugin keeps the file URLs, so that the application's bundler resolves them.
// `@vite-ignore` makes Vite leave a `new URL()` unchanged instead of inlining the file: https://github.com/vitejs/vite/pull/16590
const keepDefaultIconUrls: Plugin = {
    name: "keep-default-icon-urls",
    enforce: "pre",
    apply: (config, { command }) => command === "build" && config.build?.lib !== undefined,
    transform: (code, id) => (id.endsWith("/defaultIcons.ts") ? code.replaceAll("new URL(", `new URL(${viteIgnoreComment} `) : undefined),
    renderChunk: (code) => code.replaceAll(`${viteIgnoreComment}\n`, "").replaceAll(viteIgnoreComment, ""),
    generateBundle(_options, bundle) {
        const inlinedFile = Object.values(bundle).find((output) => output.type === "chunk" && output.code.includes("data:image/svg+xml"));
        if (inlinedFile !== undefined) {
            this.error(
                `${inlinedFile.fileName} contains an SVG as a \`data:\` URL. Check that \`keepDefaultIconUrls\` still finds \`defaultIcons.ts\`.`,
            );
        }
    },
};

export default defineConfig({
    plugins: [keepDefaultIconUrls],
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
