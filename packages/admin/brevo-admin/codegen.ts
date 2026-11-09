import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "schema.gql",
    noSilentErrors: false,
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
                    DateTime: "string",
                    JSONObject: "any",
                    EmailCampaignContentBlockData: "unknown",
                    EmailCampaignContentBlockInput: "unknown",
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
                enumsAsTypes: true,
                namingConvention: "keep",
                scalars: {
                    ID: "string",
                    DateTime: "string",
                    JSONObject: "any",
                    EmailCampaignContentBlockData: "unknown",
                    EmailCampaignContentBlockInput: "unknown",
                },
                typesPrefix: "GQL",
            },
            plugins: ["named-operations-object", "typescript-operations"],
        },
    },
};

export default config;
