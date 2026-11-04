import { buildSchema, introspectionFromSchema } from "graphql";
import { describe, expect, it } from "vitest";

import type { FormConfig } from "../../generate-command";
import { generateForm } from "../generateForm";

describe("optionalNestedFields", () => {
    it("generates form for optionalNestedFields", async () => {
        const schema = buildSchema(`
            type Query {
                product(id: ID!): Product!
            }

            type Mutation {
                createProduct(input: ProductInput!): Product!
                updateProduct(id: ID!, input: ProductInput!): Product!
            }

            type Product {
                id: ID!
                title: String!
                address: ProductAddress
            }

            type ProductAddress {
                city: String!
                zip: Int!
            }

            input ProductInput {
                title: String!
                address: ProductAddressInput
            }

            input ProductAddressInput {
                city: String!
                zip: Int!
            }
        `);
        type GQLProduct = {
            __typename?: "Product";
            id: string;
            title: string;
            address?: {
                __typename?: "ProductAddress";
                city: string;
                zip: number;
            };
        };
        const introspection = introspectionFromSchema(schema);

        const formConfig: FormConfig<GQLProduct> = {
            type: "form",
            gqlType: "Product",
            fields: [
                {
                    type: "optionalNestedFields",
                    name: "address",
                    fields: [
                        {
                            type: "text",
                            name: "city",
                        },
                        {
                            type: "number",
                            name: "zip",
                        },
                    ],
                },
            ],
        };

        const formOutput = generateForm(
            {
                gqlIntrospection: introspection,
                baseOutputFilename: "ProductForm",
                exportName: "ProductForm",
                targetDirectory: "/test",
            },
            formConfig,
        );
        expect(formOutput.code).toMatchSnapshot();
    });
});
