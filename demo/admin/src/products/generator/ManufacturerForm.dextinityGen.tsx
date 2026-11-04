import { defineConfig } from "@dextinity/admin-generator";
import type { GQLManufacturer } from "@src/graphql.generated";

export default defineConfig<GQLManufacturer>({
    type: "form",
    gqlType: "Manufacturer",
    fields: [
        { type: "text", name: "name" },
        {
            type: "fieldSet",
            name: "addressAsEmbeddable",
            title: "Address as embeddable",
            collapsible: true,
            fields: [
                { type: "text", name: "address.street" },
                { type: "number", name: "address.streetNumber" },
                { type: "text", name: "address.zip" },
                { type: "text", name: "address.country" },
                {
                    type: "optionalNestedFields",
                    name: "address.alternativeAddress",
                    checkboxLabel: "Add alternative address",
                    fields: [
                        { type: "text", name: "street" },
                        { type: "number", name: "streetNumber" },
                        { type: "text", name: "zip" },
                        { type: "text", name: "country" },
                    ],
                },
            ],
        },
        {
            type: "fieldSet",
            name: "addressAsEmbeddable",
            title: "Address as embeddable",
            collapsible: false,
            fields: [
                { type: "text", name: "addressAsEmbeddable.street" },
                { type: "number", name: "addressAsEmbeddable.streetNumber" },
                { type: "text", name: "addressAsEmbeddable.zip" },
                { type: "text", name: "addressAsEmbeddable.country" },
                { type: "text", name: "addressAsEmbeddable.alternativeAddress.street" },
                { type: "number", name: "addressAsEmbeddable.alternativeAddress.streetNumber" },
                { type: "text", name: "addressAsEmbeddable.alternativeAddress.zip" },
                { type: "text", name: "addressAsEmbeddable.alternativeAddress.country" },
            ],
        },
    ],
});
