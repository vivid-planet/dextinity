import { buildSchema, introspectionFromSchema } from "graphql";
import { describe, expect, it } from "vitest";

import type { FormConfig } from "../../generate-command";
import { generateFields } from "../generateFields";
import {
    formValuesConfigToTree,
    generateDestructFormValueForInput,
    generateFormValuesToGqlInput,
    generateFormValuesType,
    generateInitialValues,
} from "../generateFormValues";

describe("generateFormValues", () => {
    it("generates standard case without fields that need special handling", async () => {
        const schema = buildSchema(`
                    type Query {
                        products: [Product]!
                    } 
        
                    type Product {
                        id: ID!
                        name: String!
                    }
                  
                    type Mutation {
                        createProduct(input: ProductInput!): Product!
                        updateProduct(id: ID!, input: ProductInput!): Product!
                    }
        
                    input ProductInput {
                        title: String
                    }
                `);

        type GQLProduct = {
            __typename?: "Product";
            id: string;
            name: string;
        };

        const config: FormConfig<GQLProduct> = {
            type: "form",
            gqlType: "Product",
            fields: [
                {
                    type: "text",
                    name: "name",
                },
            ],
        };

        const introspection = introspectionFromSchema(schema);

        const generatedFields = generateFields({
            gqlIntrospection: introspection,
            baseOutputFilename: "ProductForm",
            fields: config.fields,
            formFragmentName: "ProductFormFragment",
            formConfig: config,
            gqlType: "Product",
        });
        const formValuesType = generateFormValuesType({
            formValuesConfig: generatedFields.formValuesConfig,
            filterByFragmentType: "GQLProductFormFragment",
            gqlIntrospection: introspection,
            gqlType: "Product",
        });
        expect(formValuesType).toEqual("type FormValues = GQLProductFormFragment;");

        const initialValues = generateInitialValues({
            mode: "all",
            formValuesConfig: generatedFields.formValuesConfig,
            filterByFragmentType: "GQLProductFormFragment",
            gqlIntrospection: introspection,
            gqlType: "Product",
            initialValuesAsProp: false,
        });
        expect(initialValues.replace(/\s+/g, " ")).toEqual(
            `const initialValues = useMemo<Partial<FormValues>>(() => data?.product ? { ...filterByFragment<GQLProductFormFragment>(productFormFragment, data.product), } : { } , [data]);`,
        );

        const destructFormValue = generateDestructFormValueForInput({
            formValuesConfig: generatedFields.formValuesConfig,
            gqlIntrospection: introspection,
            gqlType: "Product",
        });
        expect(destructFormValue).toEqual("formValues");

        const formValuesToGqlInput = generateFormValuesToGqlInput({
            formValuesConfig: generatedFields.formValuesConfig,
            gqlIntrospection: introspection,
            gqlType: "Product",
        });
        expect(formValuesToGqlInput.replace(/\s+/g, " ")).toEqual(`const output = formValues;`);
    });

    it("generates output null required text input", async () => {
        const schema = buildSchema(`
                    type Query {
                        products: [Product]!
                    } 
        
                    type Product {
                        id: ID!
                        name: String
                    }
                  
                    type Mutation {
                        createProduct(input: ProductInput!): Product!
                        updateProduct(id: ID!, input: ProductInput!): Product!
                    }
        
                    input ProductInput {
                        title: String
                    }
                `);

        type GQLProduct = {
            __typename?: "Product";
            id: string;
            name: string;
        };

        const config: FormConfig<GQLProduct> = {
            type: "form",
            gqlType: "Product",
            fields: [
                {
                    type: "text",
                    name: "name",
                },
            ],
        };

        const introspection = introspectionFromSchema(schema);

        const generatedFields = generateFields({
            gqlIntrospection: introspection,
            baseOutputFilename: "ProductForm",
            fields: config.fields,
            formFragmentName: "ProductFormFragment",
            formConfig: config,
            gqlType: "Product",
        });
        const formValuesToGqlInput = generateFormValuesToGqlInput({
            formValuesConfig: generatedFields.formValuesConfig,
            gqlIntrospection: introspection,
            gqlType: "Product",
        });
        expect(formValuesToGqlInput.replace(/\s+/g, " ")).toEqual(`const output = { ...formValues, name: formValues.name ?? null, };`);
    });

    describe("nested fields", () => {
        const schema = buildSchema(`
                    type Query {
                        products: [Product]!
                    } 
        
                    type Product {
                        id: ID!
                        address: Address!
                    }

                    type Address {
                        street: String
                        city: String!
                        zip: Int!
                    }

                    type Mutation {
                        createProduct(input: ProductInput!): Product!
                        updateProduct(id: ID!, input: ProductInput!): Product!
                    }
        
                    input ProductInput {
                        price: Float
                        address: AddressInput
                    }

                    input AddressInput {
                        street: String
                        city: String
                        zip: Int
                    }
                `);

        type GQLProduct = {
            __typename?: "Product";
            id: string;
            address: {
                __typename?: "Address";
                street: string;
                city: string;
                zip: number;
            };
        };
        const introspection = introspectionFromSchema(schema);

        it("generates nested text input that doesn't need special treatment", async () => {
            const config: FormConfig<GQLProduct> = {
                type: "form",
                gqlType: "Product",
                fields: [
                    {
                        type: "text",
                        name: "address.city",
                    },
                ],
            };

            const generatedFields = generateFields({
                gqlIntrospection: introspection,
                baseOutputFilename: "ProductForm",
                fields: config.fields,
                formFragmentName: "ProductFormFragment",
                formConfig: config,
                gqlType: "Product",
            });
            const formValuesType = generateFormValuesType({
                formValuesConfig: generatedFields.formValuesConfig,
                filterByFragmentType: "GQLProductFormFragment",
                gqlIntrospection: introspection,
                gqlType: "Product",
            });
            expect(formValuesType.replace(/\s+/g, " ")).toEqual("type FormValues = GQLProductFormFragment;");

            const initialValues = generateInitialValues({
                mode: "all",
                formValuesConfig: generatedFields.formValuesConfig,
                filterByFragmentType: "GQLProductFormFragment",
                gqlIntrospection: introspection,
                gqlType: "Product",
                initialValuesAsProp: false,
            });
            expect(initialValues.replace(/\s+/g, " ")).toEqual(
                `const initialValues = useMemo<Partial<FormValues>>(() => data?.product ? { ...filterByFragment<GQLProductFormFragment>(productFormFragment, data.product), } : { } , [data]);`,
            );

            const destructFormValue = generateDestructFormValueForInput({
                formValuesConfig: generatedFields.formValuesConfig,
                gqlIntrospection: introspection,
                gqlType: "Product",
            });
            expect(destructFormValue).toEqual("formValues");

            const formValuesToGqlInput = generateFormValuesToGqlInput({
                formValuesConfig: generatedFields.formValuesConfig,
                gqlIntrospection: introspection,
                gqlType: "Product",
            });
            expect(formValuesToGqlInput.replace(/\s+/g, " ")).toEqual(`const output = formValues;`);
        });
    });

    describe("formValuesConfigToTree unit tests", () => {
        const schema = buildSchema(`
            type Query { product: Product}
            type Product {
                id: ID!
                foo: String!
                address: Address!
                nullableAddress: Address
            }
            type Address {
                street: String
                city: String!
                zip: Int!
            } 
        `);
        const introspection = introspectionFromSchema(schema);

        it("creates simple tree", () => {
            expect(
                formValuesConfigToTree({
                    formValuesConfig: [
                        {
                            fieldName: "foo",
                        },
                    ],
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }),
            ).toEqual({ foo: { children: {}, config: { fieldName: "foo" }, nullable: false } });
        });
        it("creates nested tree", () => {
            expect(
                formValuesConfigToTree({
                    formValuesConfig: [
                        {
                            fieldName: "address.city",
                        },
                    ],
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }),
            ).toEqual({
                address: {
                    children: { city: { children: {}, config: { fieldName: "address.city" }, nullable: false } },
                    nullable: false,
                },
            });
        });

        it("creates nullable nested tree", () => {
            expect(
                formValuesConfigToTree({
                    formValuesConfig: [
                        {
                            fieldName: "nullableAddress.city",
                        },
                    ],
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }),
            ).toEqual({
                nullableAddress: {
                    children: { city: { children: {}, config: { fieldName: "nullableAddress.city" }, nullable: false } },
                    nullable: true,
                },
            });
        });
    });

    describe("generateFormValuesType unit tests", () => {
        const schema = buildSchema(`
            type Query { product: Product}
            type Product {
                id: ID!
                foo: String!
                bar: Bar!
            }
            type Bar {
                foo: String!
            } 
        `);
        const introspection = introspectionFromSchema(schema);

        it("generates type with only fragment", () => {
            expect(
                generateFormValuesType({
                    formValuesConfig: [
                        {
                            fieldName: "foo",
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }),
            ).toEqual(`type FormValues = GQLProductFormFragment;`);
        });
        it("generates type with added field", () => {
            expect(
                generateFormValuesType({
                    formValuesConfig: [
                        {
                            fieldName: "foo",
                            typeCode: { nullable: false, type: "string" },
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }),
            ).toEqual(`type FormValues = GQLProductFormFragment & { foo: string;  };`);
        });
        it("generates type with added nullable field", () => {
            expect(
                generateFormValuesType({
                    formValuesConfig: [
                        {
                            fieldName: "foo",
                            typeCode: { nullable: true, type: "string" },
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }),
            ).toEqual(`type FormValues = GQLProductFormFragment & { foo?: string;  };`);
        });
        it("generates type with omitted field", () => {
            expect(
                generateFormValuesType({
                    formValuesConfig: [
                        {
                            fieldName: "foo",
                            omitFromFragmentType: true,
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }),
            ).toEqual(`type FormValues = Omit<GQLProductFormFragment, "foo">;`);
        });
        it("generates type with omitted and field", () => {
            expect(
                generateFormValuesType({
                    formValuesConfig: [
                        {
                            fieldName: "foo",
                            omitFromFragmentType: true,
                            typeCode: { nullable: false, type: "string" },
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }),
            ).toEqual(`type FormValues = Omit<GQLProductFormFragment, "foo"> & { foo: string;  };`);
        });
        it("generates type with nested added field", () => {
            expect(
                generateFormValuesType({
                    formValuesConfig: [
                        {
                            fieldName: "bar.foo",
                            typeCode: { nullable: false, type: "string" },
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }),
            ).toEqual(`type FormValues = Omit<GQLProductFormFragment, "bar"> & { bar: GQLProductFormFragment["bar"] & { foo: string;  } };`);
        });
        it("generates type with nested omitted field", () => {
            expect(
                generateFormValuesType({
                    formValuesConfig: [
                        {
                            fieldName: "bar.foo",
                            omitFromFragmentType: true,
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }),
            ).toEqual(`type FormValues = Omit<GQLProductFormFragment, "bar"> & { bar: Omit<GQLProductFormFragment["bar"], "foo"> };`);
        });
        it("generates type with nested omitted and added field", () => {
            expect(
                generateFormValuesType({
                    formValuesConfig: [
                        {
                            fieldName: "bar.foo",
                            omitFromFragmentType: true,
                            typeCode: { nullable: false, type: "string" },
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }),
            ).toEqual(
                `type FormValues = Omit<GQLProductFormFragment, "bar"> & { bar: Omit<GQLProductFormFragment["bar"], "foo"> & { foo: string;  } };`,
            );
        });
        it("generates type with nested but not omitted or added field", () => {
            expect(
                generateFormValuesType({
                    formValuesConfig: [
                        {
                            fieldName: "bar.foo",
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }),
            ).toEqual(`type FormValues = GQLProductFormFragment;`);
        });

        it("generates type nullable two level nested fields", () => {
            const schema = buildSchema(`
                type Query { product: Product}
                type Product {
                    address: Address
                }
                type Address {
                    foo: Int!
                    alternativeAddress: AlternativeAddress
                } 
                type AlternativeAddress {
                    foo: Int!
                }
            `);
            const introspection = introspectionFromSchema(schema);

            expect(
                generateFormValuesType({
                    formValuesConfig: [
                        {
                            fieldName: "address.alternativeAddress.foo",
                            omitFromFragmentType: true,
                            typeCode: { nullable: false, type: "string" },
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }),
            ).toEqual(
                `type FormValues = Omit<GQLProductFormFragment, "address"> & { address: Omit<NonNullable<GQLProductFormFragment["address"]>, "alternativeAddress"> & { alternativeAddress: Omit<NonNullable<NonNullable<GQLProductFormFragment["address"]>["alternativeAddress"]>, "foo"> & { foo: string;  } } };`,
            );
        });
    });

    describe("generateInitialValues code unit tests", () => {
        const schema = buildSchema(`
            type Query { product: Product}
            type Product {
                id: ID!
                foo: String!
                bar: Bar!
            }
            type Bar {
                foo: String!
            } 
        `);
        const introspection = introspectionFromSchema(schema);

        it("generates code with no special fields", () => {
            expect(
                generateInitialValues({
                    formValuesConfig: [
                        {
                            fieldName: "foo",
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    mode: "all",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                    initialValuesAsProp: false,
                }).replace(/\s+/g, " "),
            ).toEqual(
                `const initialValues = useMemo<Partial<FormValues>>(() => data?.product ? { ...filterByFragment<GQLProductFormFragment>(productFormFragment, data.product), } : { } , [data]);`,
            );
        });
        it("generates code with default value with no special fields", () => {
            expect(
                generateInitialValues({
                    formValuesConfig: [
                        {
                            fieldName: "foo",
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    mode: "add",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                    initialValuesAsProp: false,
                }).replace(/\s+/g, " "),
            ).toEqual(`const initialValues = { };`);
        });
        it("generates code with string conversion for field", () => {
            expect(
                generateInitialValues({
                    formValuesConfig: [
                        {
                            fieldName: "foo",
                            initializationCode: "String(data.product.foo)",
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    mode: "all",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                    initialValuesAsProp: false,
                }).replace(/\s+/g, " "),
            ).toEqual(
                `const initialValues = useMemo<Partial<FormValues>>(() => data?.product ? { ...filterByFragment<GQLProductFormFragment>(productFormFragment, data.product), foo: String(data.product.foo), } : { } , [data]);`,
            );
        });
        it("generates code with default value for field", () => {
            expect(
                generateInitialValues({
                    formValuesConfig: [
                        {
                            fieldName: "foo",
                            defaultInitializationCode: "true",
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    mode: "all",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                    initialValuesAsProp: false,
                }).replace(/\s+/g, " "),
            ).toEqual(
                `const initialValues = useMemo<Partial<FormValues>>(() => data?.product ? { ...filterByFragment<GQLProductFormFragment>(productFormFragment, data.product), } : { foo: true, } , [data]);`,
            );
        });
        it("generates code with default value for field in add mode", () => {
            expect(
                generateInitialValues({
                    formValuesConfig: [
                        {
                            fieldName: "foo",
                            defaultInitializationCode: "true",
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    mode: "add",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                    initialValuesAsProp: false,
                }).replace(/\s+/g, " "),
            ).toEqual(`const initialValues = { foo: true, };`);
        });
        it("generates code with default value for nested field", () => {
            expect(
                generateInitialValues({
                    formValuesConfig: [
                        {
                            fieldName: "bar.foo",
                            defaultInitializationCode: "true",
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    mode: "all",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                    initialValuesAsProp: false,
                }).replace(/\s+/g, " "),
            ).toEqual(
                `const initialValues = useMemo<Partial<FormValues>>(() => data?.product ? { ...filterByFragment<GQLProductFormFragment>(productFormFragment, data.product), } : { bar: { foo: true, }, } , [data]);`,
            );
        });
        it("generates code string conversion for nested field", () => {
            expect(
                generateInitialValues({
                    formValuesConfig: [
                        {
                            fieldName: "bar.foo",
                            initializationCode: "String(data.product.bar.foo)",
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    mode: "all",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                    initialValuesAsProp: false,
                }).replace(/\s+/g, " "),
            ).toEqual(
                `const initialValues = useMemo<Partial<FormValues>>(() => data?.product ? { ...filterByFragment<GQLProductFormFragment>(productFormFragment, data.product), bar: { ...data.product.bar, foo: String(data.product.bar.foo), }, } : { } , [data]);`,
            );
        });
        it("generates code with nullable nested field", () => {
            const schema = buildSchema(`
                type Query { product: Product}
                type Product {
                    id: ID!
                    bar: Bar
                }
                type Bar {
                    foo: String!
                } 
            `);
            const introspection = introspectionFromSchema(schema);

            expect(
                generateInitialValues({
                    formValuesConfig: [
                        {
                            fieldName: "bar",
                        },
                        {
                            fieldName: "bar.foo",
                            initializationCode: "String(data.product.bar.foo)",
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    mode: "all",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                    initialValuesAsProp: false,
                }).replace(/\s+/g, " "),
            ).toEqual(
                `const initialValues = useMemo<Partial<FormValues>>(() => data?.product ? { ...filterByFragment<GQLProductFormFragment>(productFormFragment, data.product), bar: data.product.bar ? { ...data.product.bar, foo: String(data.product.bar.foo), } : undefined, } : { } , [data]);`,
            );
        });
        it("generates code with nullable field for dimensions field", () => {
            const schema = buildSchema(`
                type Query { product: Product}
                type Product {
                    dimensions: Dimensions
                }
                type Dimensions {
                    width: Int!
                } 
            `);
            const introspection = introspectionFromSchema(schema);

            expect(
                generateInitialValues({
                    formValuesConfig: [
                        {
                            fieldName: "dimensions.width",
                            initializationCode: "String(data.product.dimensions.width)",
                        },
                        {
                            fieldName: "dimensionsEnabled",
                            initializationCode: "!!data.product.dimensions",
                        },
                        {
                            fieldName: "dimensions",
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    mode: "all",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                    initialValuesAsProp: false,
                }).replace(/\s+/g, " "),
            ).toEqual(
                `const initialValues = useMemo<Partial<FormValues>>(() => data?.product ?
                    { ...filterByFragment<GQLProductFormFragment>(productFormFragment, data.product),
                     dimensions: data.product.dimensions ? { ...data.product.dimensions, width: String(data.product.dimensions.width), } : undefined,
                     dimensionsEnabled: !!data.product.dimensions,
                     } : { } , [data]);`.replace(/\s+/g, " "),
            );
        });

        it("generates code with initialValuesAsProp", () => {
            expect(
                generateInitialValues({
                    formValuesConfig: [
                        {
                            fieldName: "foo",
                        },
                    ],
                    filterByFragmentType: "GQLProductFormFragment",
                    mode: "all",
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                    initialValuesAsProp: true,
                }).replace(/\s+/g, " "),
            ).toEqual(
                `const initialValues = useMemo<Partial<FormValues>>(() => data?.product ? { ...filterByFragment<GQLProductFormFragment>(productFormFragment, data.product), } : { ...passedInitialValues, } , [data]);`,
            );
        });
    });

    describe("generateFormValuesToGqlInput code unit tests", () => {
        const schema = buildSchema(`
            type Query { product: Product}
            type Product {
                id: ID!
                foo: String!
                foo2: String!
                bar: Bar!
            }
            type Bar {
                foo: String!
            } 
        `);
        const introspection = introspectionFromSchema(schema);

        it("generates code with no special fields", () => {
            expect(
                generateFormValuesToGqlInput({
                    formValuesConfig: [
                        {
                            fieldName: "foo",
                        },
                    ],
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }).replace(/\s+/g, " "),
            ).toEqual(`const output = formValues;`);
        });
        it("generates code with float conversion for field", () => {
            expect(
                generateFormValuesToGqlInput({
                    formValuesConfig: [
                        {
                            fieldName: "foo",
                            formValueToGqlInputCode: "parseFloat($fieldName)",
                        },
                    ],
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }).replace(/\s+/g, " "),
            ).toEqual(`const output = { ...formValues, foo: parseFloat(formValues.foo), };`);
        });
        it("generates code with float conversion for two fields", () => {
            expect(
                generateFormValuesToGqlInput({
                    formValuesConfig: [
                        {
                            fieldName: "foo",
                            formValueToGqlInputCode: "parseFloat($fieldName)",
                        },
                        {
                            fieldName: "foo2",
                            formValueToGqlInputCode: "parseFloat($fieldName)",
                        },
                    ],
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }).replace(/\s+/g, " "),
            ).toEqual(`const output = { ...formValues, foo: parseFloat(formValues.foo), foo2: parseFloat(formValues.foo2), };`);
        });
        it("generates code with float conversion for nested field", () => {
            expect(
                generateFormValuesToGqlInput({
                    formValuesConfig: [
                        {
                            fieldName: "bar.foo",
                            formValueToGqlInputCode: "parseFloat($fieldName)",
                        },
                    ],
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }).replace(/\s+/g, " "),
            ).toEqual(`const output = { ...formValues, bar: { ...formValues.bar, foo: parseFloat(formValues.bar.foo), }, };`);
        });
        it("generates code with no conversion for nested field", () => {
            expect(
                generateFormValuesToGqlInput({
                    formValuesConfig: [
                        {
                            fieldName: "bar.foo",
                        },
                    ],
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }).replace(/\s+/g, " "),
            ).toEqual(`const output = formValues;`);
        });
        it("generates code with wrapFormValueToGqlInputCode for field", () => {
            expect(
                generateFormValuesToGqlInput({
                    formValuesConfig: [
                        {
                            fieldName: "bar",
                            wrapFormValueToGqlInputCode: "formValues.barEnabled && formValues.bar ? $inner : null",
                        },
                        {
                            fieldName: "bar.foo",
                            formValueToGqlInputCode: "parseFloat($fieldName)",
                        },
                    ],
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }).replace(/\s+/g, " "),
            ).toEqual(
                `const output = { ...formValues, bar: formValues.barEnabled && formValues.bar ? { ...formValues.bar, foo: parseFloat(formValues.bar.foo), } : null, };`,
            );
        });
        it("generates code for issue with wrapFormValueToGqlInputCode", () => {
            const schema = buildSchema(`
                type Query { product: Product}
                type Product {
                    dimensions: Dimensions
                    availableSince: String
                }
                type Dimensions {
                    width: Int!
                } 
            `);
            const introspection = introspectionFromSchema(schema);

            expect(
                generateFormValuesToGqlInput({
                    formValuesConfig: [
                        {
                            fieldName: "dimensions.width",
                            formValueToGqlInputCode: "parseFloat($fieldName)",
                        },
                        {
                            fieldName: "dimensionsEnabled",
                        },
                        {
                            fieldName: "dimensions",
                            wrapFormValueToGqlInputCode: "formValues.dimensionsEnabled && formValues.dimensions ? $inner : null",
                        },
                        {
                            fieldName: "availableSince",
                            formValueToGqlInputCode: "$fieldName ?? null",
                        },
                    ],
                    gqlIntrospection: introspection,
                    gqlType: "Product",
                }).replace(/\s+/g, " "),
            ).toEqual(
                `const output = { ...formValues, dimensions: formValues.dimensionsEnabled && formValues.dimensions ? { ...formValues.dimensions, width: parseFloat(formValues.dimensions.width), } : null, availableSince: formValues.availableSince ?? null, };`,
            );
        });
    });
    describe("generateDestructFormValueForInput and generateFormValuesToGqlInput code unit tests", () => {
        const schema = buildSchema(`
            type Query { product: Product}
            type Product {
                id: ID!
                foo: String!
                foo2: String!
                bar: Bar!
            }
            type Bar {
                foo: String!
                foo2: String!
            } 
        `);
        const introspection = introspectionFromSchema(schema);

        it("generates code with no destructed field", () => {
            const formValuesConfig = [
                {
                    fieldName: "foo",
                },
            ];
            expect(
                generateDestructFormValueForInput({ formValuesConfig, gqlIntrospection: introspection, gqlType: "Product" }).replace(/\s+/g, " "),
            ).toEqual(`formValues`);
            expect(
                generateFormValuesToGqlInput({ formValuesConfig, gqlIntrospection: introspection, gqlType: "Product" }).replace(/\s+/g, " "),
            ).toEqual(`const output = formValues;`);
        });

        it("generates code with no destructed nested field", () => {
            const formValuesConfig = [
                {
                    fieldName: "bar.foo",
                },
            ];
            expect(
                generateDestructFormValueForInput({ formValuesConfig, gqlIntrospection: introspection, gqlType: "Product" }).replace(/\s+/g, " "),
            ).toEqual(`formValues`);
            expect(
                generateFormValuesToGqlInput({ formValuesConfig, gqlIntrospection: introspection, gqlType: "Product" }).replace(/\s+/g, " "),
            ).toEqual(`const output = formValues;`);
        });

        it("generates code with nested field and conversion and destruct for another nested field", () => {
            const schema = buildSchema(`
                type Query { product: Product}
                type Product {
                    id: ID!
                    bar: Bar!
                    baz: Baz!
                }
                type Bar {
                    foo: String!
                } 
                type Baz {
                    foo: String!
                }
            `);
            const introspection = introspectionFromSchema(schema);

            const formValuesConfig = [
                {
                    fieldName: "baz.foo",
                    destructFromFormValues: true,
                },
                {
                    fieldName: "bar.foo",
                    formValueToGqlInputCode: "parseFloat($fieldName)",
                },
            ];
            expect(
                generateDestructFormValueForInput({ formValuesConfig, gqlIntrospection: introspection, gqlType: "Product" }).replace(/\s+/g, " "),
            ).toEqual(`{ baz: { foo, ...formValuesBazRest }, ...formValuesRest }`);
            expect(
                generateFormValuesToGqlInput({ formValuesConfig, gqlIntrospection: introspection, gqlType: "Product" }).replace(/\s+/g, " "),
            ).toEqual(
                `const output = { ...formValuesRest, baz: { ...formValuesBazRest, }, bar: { ...formValuesRest.bar, foo: parseFloat(formValuesRest.bar.foo), }, };`,
            );
        });
        it("generates code with destructed field", () => {
            const formValuesConfig = [
                {
                    fieldName: "foo",
                    destructFromFormValues: true,
                },
                {
                    fieldName: "foo2",
                },
            ];
            expect(
                generateDestructFormValueForInput({ formValuesConfig, gqlIntrospection: introspection, gqlType: "Product" }).replace(/\s+/g, " "),
            ).toEqual(`{ foo, ...formValuesRest }`);
            expect(
                generateFormValuesToGqlInput({ formValuesConfig, gqlIntrospection: introspection, gqlType: "Product" }).replace(/\s+/g, " "),
            ).toEqual(`const output = formValuesRest;`);
        });
        it("generates code with destructed nested field", () => {
            const formValuesConfig = [
                {
                    fieldName: "bar.foo",
                    destructFromFormValues: true,
                },
                {
                    fieldName: "bar.foo2",
                },
            ];
            expect(
                generateDestructFormValueForInput({ formValuesConfig, gqlIntrospection: introspection, gqlType: "Product" }).replace(/\s+/g, " "),
            ).toEqual(`{ bar: { foo, ...formValuesBarRest }, ...formValuesRest }`);
            expect(
                generateFormValuesToGqlInput({ formValuesConfig, gqlIntrospection: introspection, gqlType: "Product" }).replace(/\s+/g, " "),
            ).toEqual(`const output = { ...formValuesRest, bar: { ...formValuesBarRest, }, };`);
        });

        it("generates code with destructed nested field and conversion", () => {
            const formValuesConfig = [
                {
                    fieldName: "bar.foo",
                    destructFromFormValues: true,
                },
                {
                    fieldName: "bar.foo2",
                    formValueToGqlInputCode: "parseFloat($fieldName)",
                },
            ];
            expect(
                generateDestructFormValueForInput({ formValuesConfig, gqlIntrospection: introspection, gqlType: "Product" }).replace(/\s+/g, " "),
            ).toEqual(`{ bar: { foo, ...formValuesBarRest }, ...formValuesRest }`);
            expect(
                generateFormValuesToGqlInput({ formValuesConfig, gqlIntrospection: introspection, gqlType: "Product" }).replace(/\s+/g, " "),
            ).toEqual(`const output = { ...formValuesRest, bar: { ...formValuesBarRest, foo2: parseFloat(formValuesBarRest.foo2), }, };`);
        });

        it("generates code with destructed nested field and conversion three levels deep", () => {
            const schema = buildSchema(`
                type Query { product: Product}
                type Product {
                    id: ID!
                    foo: Foo!
                }
                type Foo {
                    bar: Bar!
                } 
                type Bar {
                    baz: String!
                    bum: String!
                }
            `);
            const introspection = introspectionFromSchema(schema);
            const formValuesConfig = [
                {
                    fieldName: "foo.bar.baz",
                    destructFromFormValues: true,
                },
                {
                    fieldName: "foo.bar.bum",
                    formValueToGqlInputCode: "parseFloat($fieldName)",
                },
            ];
            expect(
                generateDestructFormValueForInput({ formValuesConfig, gqlIntrospection: introspection, gqlType: "Product" }).replace(/\s+/g, " "),
            ).toEqual(`{ foo: { bar: { baz, ...formValuesFooBarRest }, ...formValuesFooRest }, ...formValuesRest }`);
            expect(
                generateFormValuesToGqlInput({ formValuesConfig, gqlIntrospection: introspection, gqlType: "Product" }).replace(/\s+/g, " "),
            ).toEqual(
                `const output = { ...formValuesRest, foo: { ...formValuesFooRest, bar: { ...formValuesFooBarRest, bum: parseFloat(formValuesFooBarRest.bum), }, }, };`,
            );
        });
    });
});
