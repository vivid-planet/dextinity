import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";

// Written on its own rather than derived from `vite.config.mts`: that config is a function of `mode`, injects the
// environment into the HTML entry and compresses the build, none of which a spec run has or needs. The one thing
// repeated from it is the React plugin, because a component styled through `@emotion` renders differently without it.
export default defineConfig({
    plugins: [
        react({
            jsxImportSource: "@emotion/react",
            plugins: [
                [
                    "@swc/plugin-emotion",
                    {
                        importMap: {
                            "@mui/system": {
                                styled: {
                                    canonicalImport: ["@emotion/styled", "default"],
                                    styledBaseImport: ["@mui/system", "styled"],
                                },
                            },
                            "@mui/material/styles": {
                                styled: {
                                    canonicalImport: ["@emotion/styled", "default"],
                                    styledBaseImport: ["@mui/material/styles", "styled"],
                                },
                            },
                        },
                    },
                ],
            ],
        }),
    ],
    resolve: {
        tsconfigPaths: true,
    },
    define: {
        global: "globalThis",
    },
    test: {
        environment: "jsdom",
        setupFiles: ["./src/testing/vitest.setup.ts"],
        reporters: ["default", "junit"],
        outputFile: { junit: "./junit-unit.xml" },
        exclude: ["**/node_modules/**", "**/build/**"],
        server: {
            deps: {
                // The `@dextinity` packages ship ESM whose relative imports carry no file extension, so Node cannot
                // load them on its own. They have to go through the Vite resolver the way they do in a build.
                inline: [/@dextinity\//],
            },
        },
    },
});
