module.exports = function () {
    return {
        presets: [
            [
                "@babel/preset-env",
                {
                    modules: false,
                },
            ],
            [
                "@babel/preset-typescript",
                {
                    allowDeclareFields: true,
                },
            ],
            [
                "@babel/preset-react",
                {
                    runtime: "automatic",
                },
            ],
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
    };
};
