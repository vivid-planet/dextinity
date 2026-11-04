import { buildSchema, introspectionFromSchema } from "graphql";
import { describe, expect, it } from "vitest";

import type { FormConfig, FormFieldConfig } from "../../generate-command";
import { generateFormField } from "../generateFormField";

describe("AsyncSelect rendered props", () => {
    it("generates readonly async select", async () => {
        const schema = buildSchema(`
            type Query {
                products: [Product]!
                categories: [Category]!
            } 

            type Product {
                id: ID!
                title: String!
                category: Category!
            }
            type Category {
                id: ID!
                name: String!
            }

            type Mutation {
                createProduct(input: ProductInput!): Product!
                updateProduct(id: ID!, input: ProductInput!): Product!
            }

            input ProductInput {
                title: String
                category: ID
            }
        `);
        type GQLCategory = {
            __typename?: "Category";
            id: string;
            name: string;
        };
        type GQLProduct = {
            __typename?: "Product";
            id: string;
            title: string;
            category: GQLCategory;
        };

        const introspection = introspectionFromSchema(schema);

        const fieldConfig: FormFieldConfig<GQLProduct> = {
            type: "asyncSelect",
            rootQuery: "categories",
            name: "category",
            readOnly: true,
        };
        const formConfig: FormConfig<GQLProduct> = {
            type: "form",
            gqlType: "Product",
            fields: [fieldConfig],
        };

        const output = generateFormField({
            gqlIntrospection: introspection,
            baseOutputFilename: "ProductForm",
            formFragmentName: "ProductFormFragment",
            config: fieldConfig,
            formConfig,
            gqlType: "Product",
        });

        expect(output.code).toMatchSnapshot();
    });
});
