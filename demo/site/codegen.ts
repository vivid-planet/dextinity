import { resolve } from "node:path";

import { CodegenConfig } from "@graphql-codegen/cli";
import { readFileSync } from "fs";
import { buildSchema } from "graphql";

const schema = buildSchema(readFileSync(resolve(__dirname, "./schema.gql")).toString());

const rootBlocks = Object.keys(schema.getTypeMap()).filter((type) => type.endsWith("BlockData"));

const config: CodegenConfig = {
    schema: "schema.gql",
    generates: {
        "./src/graphql.generated.ts": {
            plugins: [{ add: { content: `import { ${rootBlocks.sort().join(", ")} } from "./blocks.generated";` } }, "typescript"],
            config: {
                avoidOptionals: {
                    field: true,
                },
                enumsAsTypes: true,
                namingConvention: "keep",
                scalars: rootBlocks.reduce((scalars, rootBlock) => ({ ...scalars, [rootBlock]: rootBlock }), {
                    DateTime: "string",
                    Date: "string",
                    LocalDate: "string",
                    BigInt: "number",
                }),
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
                scalars: rootBlocks.reduce((scalars, rootBlock) => ({ ...scalars, [rootBlock]: rootBlock }), {
                    DateTime: "string",
                    Date: "string",
                    LocalDate: "string",
                    BigInt: "number",
                }),
                typesPrefix: "GQL",
            },
            plugins: [
                { add: { content: `import { ${rootBlocks.sort().join(", ")} } from "@src/blocks.generated";` } },
                "named-operations-object",
                "typescript-operations",
            ],
        },
    },
};

export default config;
