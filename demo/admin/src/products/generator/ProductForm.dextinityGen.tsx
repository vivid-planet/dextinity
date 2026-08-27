import { defineConfig, type InjectedFormVariables, injectFormVariables } from "@dextinity/admin-generator";
import { DamImageBlock } from "@dextinity/cms-admin";
import type { GQLProduct } from "@src/graphql.generated";
import { productTypeValues } from "@src/products/generator/productTypeValues";
import { FormattedMessage } from "react-intl";

import { FutureProductNotice } from "../helpers/FutureProductNotice";
import { validateProductSlug } from "./validateProductSlug";

export default defineConfig<GQLProduct>({
    type: "form",
    gqlType: "Product",
    fragmentName: "ProductFormDetails", // configurable as it must be unique across project
    navigateOnCreate: false,
    initialValuesAsProp: true,
    fields: [
        {
            type: "fieldSet",
            name: "mainData",
            supportText: "Product: {title}",
            collapsible: false,
            initiallyExpanded: true,
            fields: [
                {
                    type: "text",
                    name: "title",
                    label: "Title", // default is generated from name (camelCaseToHumanReadable)
                    required: true, // default is inferred from gql schema
                    initialValue: "New Product",
                    validate: (value: string) =>
                        value.length < 3 ? (
                            <FormattedMessage id="product.validate.titleMustBe3CharsLog" defaultMessage="Title must be at least 3 characters long" />
                        ) : undefined,
                },
                {
                    type: "text",
                    name: "slug",
                    validate: injectFormVariables(
                        ({ id, client, manufacturerCountry }: InjectedFormVariables & { manufacturerCountry: string }) =>
                            (value: string) => {
                                // eslint-disable-next-line no-console
                                console.log(manufacturerCountry);
                                return validateProductSlug({ value, id, client });
                            },
                    ),
                },
                { type: "date", name: "createdAt", label: "Created At", readOnly: true },
                { type: "text", name: "description", label: "Description", multiline: true },
                {
                    type: "staticSelect",
                    name: "type",
                    label: "Type",
                    required: true,
                    inputType: "radio",
                    values: productTypeValues,
                    initialValue: "cap",
                },
                { type: "staticSelect", name: "additionalTypes" },
                { type: "asyncSelect", name: "category", rootQuery: "productCategories" },
                { type: "asyncSelect", name: "tags", rootQuery: "productTags" },
                {
                    type: "numberRange",
                    name: "priceRange",
                    label: "Price range",
                    minValue: 25,
                    maxValue: 500,
                    disableSlider: true,
                    startAdornment: "€",
                    initialValue: { min: 10, max: 100 },
                },
                {
                    type: "optionalNestedFields",
                    name: "dimensions",
                    checkboxLabel: "Configure dimensions",
                    fields: [
                        { type: "number", name: "width", label: "Width" },
                        { type: "number", name: "height", label: "Height" },
                        { type: "number", name: "depth", label: "Depth" },
                    ],
                },
            ],
        },
        {
            type: "fieldSet",
            name: "additionalData",
            fields: [
                {
                    type: "asyncSelect",
                    name: "manufacturer",
                    rootQuery: "manufacturers",
                    filter: {
                        type: "formProp",
                        propName: "manufacturerCountry",
                        rootQueryArg: "addressAsEmbeddable_country",
                    },
                    startAdornment: { icon: "Location" },
                },
                { type: "boolean", name: "inStock", label: "In stock", initialValue: true },
                { type: "date", name: "availableSince", startAdornment: { icon: "CalendarToday" }, initialValue: "2025-01-01" },
                { type: "component", component: FutureProductNotice },
                { type: "block", name: "image", label: "Image", block: DamImageBlock },
                { type: "fileUpload", name: "priceList", label: "Price List", maxFileSize: 1024 * 1024 * 4, download: true },
                { type: "fileUpload", name: "datasheets", label: "Datasheets", multiple: true, maxFileSize: 1024 * 1024 * 4, download: false },
                { type: "dateTime", name: "lastCheckedAt", label: "Last checked at", initialValue: new Date("2018-01-12T00:00:00Z") },
            ],
        },
    ],
});

/*
TODO
export const tabsConfig: TabsConfig = {
    type: "tabs",
    tabs: [{ name: "form", content: formConfig }],
};

//alternative syntax for the above
export const tabsConfig2: TabsConfig = {
    type: "tabs",
    tabs: [
        {
            name: "form",
            content: {
                type: "form",
                gqlType: "Product",
                fields: [
                    { type: "text", name: "title", label: "Title" },
                    { type: "text", name: "slug", label: "Slug" },
                    { type: "text", name: "description", label: "Description", multiline: true },
                    { type: "staticSelect", name: "type", label: "Type" / *, values: from gql schema (overridable)* / },
                    { type: "asyncSelect", name: "type", label: "Type" / *, endpoint: from gql schema (overridable)* / },
                    { type: "block", name: "image", label: "Image", block: PixelImageBlock },
                ],
            } satisfies FormConfig<GQLProduct>,
        },
    ],
};

*/
