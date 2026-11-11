import { describe, expect, it } from "vitest";

import { defineConfig, type FormConfig, type InjectedFormVariables, injectFormVariables } from "../generate-command";

type GQLProduct = {
    __typename?: "Product";
    id: string;
    title: string;
    price: number;
    inStock: boolean;
    availableSince: string;
    lastCheckedAt: string;
    type: string;
    category: { __typename?: "ProductCategory"; id: string } | null;
};

describe("config types", () => {
    it("types validate according to the field's value", () => {
        const config = defineConfig<GQLProduct>({
            type: "form",
            gqlType: "Product",
            fields: [
                {
                    type: "text",
                    name: "title",
                    validate: (value: string | null | undefined) => (value && value.length < 3 ? "Too short" : undefined),
                },
                { type: "number", name: "price", validate: (value?: number | null) => (value != null && value < 0 ? "Negative" : undefined) },
                { type: "boolean", name: "inStock", validate: (value?: boolean | null) => (value ? undefined : "Required") },
                { type: "date", name: "availableSince", validate: (value?: string | null) => value?.toUpperCase() },
                { type: "dateTime", name: "lastCheckedAt", validate: (value?: Date | null) => value?.toISOString() },
                { type: "staticSelect", name: "type", validate: (value?: string | string[] | null) => value?.length },
                // @ts-expect-error a text field's value can be null or undefined
                { type: "text", name: "title", validate: (value: string) => value.length },
                // @ts-expect-error a number field's value isn't a string
                { type: "number", name: "price", validate: (value?: string | null) => value },
                // @ts-expect-error validate isn't supported for async selects
                { type: "asyncSelect", name: "category", rootQuery: "productCategories", validate: () => undefined },
            ],
        });

        expect(config.type).toBe("form");
    });

    it("allows declaring additional form props in injectFormVariables", () => {
        const fields: FormConfig<GQLProduct>["fields"] = [
            {
                type: "text",
                name: "title",
                validate: injectFormVariables(
                    ({ id, manufacturerCountry }: InjectedFormVariables & { manufacturerCountry: string }) =>
                        (value?: string | null) =>
                            value === manufacturerCountry ? id : undefined,
                ),
            },
        ];

        // @ts-expect-error manufacturerCountry isn't an injected variable without declaring it
        injectFormVariables(({ manufacturerCountry }: InjectedFormVariables) => manufacturerCountry);
        const readPropNotExtendingInjectedVariables = ({ manufacturerCountry }: { manufacturerCountry: number }) => manufacturerCountry;
        // @ts-expect-error additional form props must extend InjectedFormVariables
        injectFormVariables(readPropNotExtendingInjectedVariables);

        expect(fields).toHaveLength(1);
    });
});
