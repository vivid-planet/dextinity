import { defineConfig, type OxlintConfig } from "oxlint";

export const resolvePlugin = (specifier: string) => import.meta.resolve(specifier);

export const restrictedImportPatterns = [
    {
        group: ["@dextinity/*/lib", "@dextinity/*/lib/**"],
        message: "Don't import private files from @dextinity packages via /lib. Use the package root instead.",
    },
];

const config: OxlintConfig = defineConfig({
    plugins: ["eslint", "typescript", "import"],
    jsPlugins: [
        { name: "@dextinity", specifier: resolvePlugin("@dextinity/eslint-plugin") },
        { name: "simple-import-sort", specifier: resolvePlugin("eslint-plugin-simple-import-sort") },
        { name: "import-js", specifier: resolvePlugin("eslint-plugin-import") },
    ],
    categories: {
        correctness: "error",
    },
    env: {
        builtin: true,
        es2024: true,
        node: true,
    },
    options: {
        typeAware: true,
    },
    rules: {
        "no-case-declarations": "error",
        "no-empty": "error",
        "no-fallthrough": "error",
        "no-prototype-builtins": "error",
        "no-regex-spaces": "error",
        "no-unexpected-multiline": "error",
        "no-var": "error",
        "prefer-const": "error",
        "prefer-rest-params": "error",
        "prefer-spread": "error",
        "no-array-constructor": "error",
        "no-unused-expressions": "error",
        "no-unused-vars": ["error", { args: "none", ignoreRestSiblings: true }],
        "no-unreachable": "off",

        "typescript/ban-ts-comment": "error",
        "typescript/no-empty-object-type": "error",
        "typescript/no-explicit-any": "error",
        "typescript/no-namespace": "error",
        "typescript/no-require-imports": "error",
        "typescript/no-unnecessary-type-constraint": "error",
        "typescript/no-unsafe-function-type": "error",

        "prefer-template": "error",
        "no-console": ["error", { allow: ["warn", "error", "info", "debug"] }],
        curly: "error",
        "typescript/return-await": ["error", "in-try-catch"],
        "no-restricted-imports": ["error", { patterns: restrictedImportPatterns }],
        "typescript/no-inferrable-types": ["error", { ignoreProperties: true }],
        "typescript/prefer-enum-initializers": "error",
        "typescript/no-non-null-assertion": "error",
        "typescript/no-import-type-side-effects": "error",
        "typescript/consistent-type-imports": [
            "error",
            {
                prefer: "type-imports",
                disallowTypeAnnotations: false,
                fixStyle: "inline-type-imports",
            },
        ],

        "import/no-duplicates": ["error", { preferInline: true }],
        "import/newline-after-import": "error",
        "import-js/no-extraneous-dependencies": "error",

        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",

        "@dextinity/no-other-module-relative-import": "warn",

        "typescript/await-thenable": "off",
        "typescript/no-array-delete": "off",
        "typescript/no-base-to-string": "off",
        "typescript/no-duplicate-type-constituents": "off",
        "typescript/no-floating-promises": "off",
        "typescript/no-for-in-array": "off",
        "typescript/no-implied-eval": "off",
        "typescript/no-meaningless-void-operator": "off",
        "typescript/no-misused-spread": "off",
        "typescript/no-redundant-type-constituents": "off",
        "typescript/no-unsafe-unary-minus": "off",
        "typescript/no-useless-default-assignment": "off",
        "typescript/require-array-sort-compare": "off",
        "typescript/restrict-template-expressions": "off",
        "typescript/unbound-method": "off",
    },
    overrides: [
        {
            files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
            env: {
                vitest: true,
                jest: true,
            },
        },
    ],
});

export default config;
