const typeScriptFilePattern = /\.[cm]?ts$/;

// Babel 7 disabled JSX parsing for .ts files, Babel 8 doesn't anymore. JSX parsing breaks generic arrow functions like `<T>(arg: T) => arg`.
// The @emotion plugin enables it before the TypeScript parser plugin is registered, so it has to be removed again afterwards.
function disableJsxParsing() {
    return {
        name: "disable-jsx-parsing",
        manipulateOptions(options, parserOptions) {
            const jsxPluginIndex = parserOptions.plugins.findIndex((plugin) => (Array.isArray(plugin) ? plugin[0] : plugin) === "jsx");
            if (jsxPluginIndex !== -1) {
                parserOptions.plugins.splice(jsxPluginIndex, 1);
            }
        },
    };
}

module.exports = function () {
    return {
        presets: [
            [
                "@babel/preset-env",
                {
                    modules: false,
                },
            ],
            "@babel/preset-typescript",
        ],
        plugins: [
            [
                "@emotion",
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
        overrides: [
            {
                test: typeScriptFilePattern,
                plugins: [disableJsxParsing],
            },
            {
                exclude: typeScriptFilePattern,
                presets: [
                    [
                        "@babel/preset-react",
                        {
                            runtime: "automatic",
                            development: false, // Babel 8 enables it unless NODE_ENV is set, which would make the published packages import the dev-only `react/jsx-dev-runtime`
                        },
                    ],
                ],
            },
        ],
    };
};
