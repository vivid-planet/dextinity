import { buildSchema, introspectionFromSchema } from "graphql";
import { describe, expect, it } from "vitest";

import type { FormConfig, FormFieldConfig } from "../../generate-command";
import { generateFormField } from "../generateFormField";

describe("AsyncSelect autocomplete", () => {
    it("generates field with default autocomplete because of search arg", async () => {
        const schema = buildSchema(`
            type Query {
                products: [Product]!
                categories(search: String): [Category]!
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

    it("generates field without autocomplete explicitly set", async () => {
        const schema = buildSchema(`
            type Query {
                products: [Product]!
                categories(search: String): [Category]!
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
            autocomplete: false,
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

    it("throws error if autocomplete is true but there is no search arg", async () => {
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
            autocomplete: true,
        };
        const formConfig: FormConfig<GQLProduct> = {
            type: "form",
            gqlType: "Product",
            fields: [fieldConfig],
        };

        expect(() => {
            generateFormField({
                gqlIntrospection: introspection,
                baseOutputFilename: "ProductForm",
                formFragmentName: "ProductFormFragment",
                config: fieldConfig,
                formConfig,
                gqlType: "Product",
            });
        }).toThrow();
    });

    it("throws error if search arg is no String", async () => {
        const schema = buildSchema(`
            type Query {
                products: [Product]!
                categories(search: Int): [Category]!
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
        };
        const formConfig: FormConfig<GQLProduct> = {
            type: "form",
            gqlType: "Product",
            fields: [fieldConfig],
        };

        expect(() => {
            generateFormField({
                gqlIntrospection: introspection,
                baseOutputFilename: "ProductForm",
                formFragmentName: "ProductFormFragment",
                config: fieldConfig,
                formConfig,
                gqlType: "Product",
            });
        }).toThrow();
    });
});
