import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "schema.gql",
    generates: {
        "./src/graphql.generated.ts": {
            plugins: ["typescript"],
            config: {
                avoidOptionals: {
                    field: true,
                },
                enumsAsTypes: true,
                namingConvention: "keep",
                scalars: {
                    BigInt: "number",
                },
                typesPrefix: "GQL",
            },
        },

        "./src/": {
            documents: ["./src/**/!(*.generated).{tsx,ts}"],
            preset: "near-operation-file",
            presetConfig: {
                extension: ".generated.ts",
                baseTypesPath: "graphql.generated.ts",
            },
            config: {
                avoidOptionals: {
                    field: true,
                },
                enumsAsTypes: true,
                namingConvention: "keep",
                scalars: {
                    BigInt: "number",
                },
                typesPrefix: "GQL",
            },
            plugins: ["named-operations-object", "typescript-operations"],
        },
    },
};

export default config;
