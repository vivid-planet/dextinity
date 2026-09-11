import { defineConfig } from "@dextinity/admin-generator";
import type { GQLProduct } from "@src/graphql.generated";

export default defineConfig<GQLProduct>({
    type: "form",
    gqlType: "Product",
    mode: "edit",
    fragmentName: "ProductPriceFormDetails", // configurable as it must be unique across project
    fields: [{ type: "number", name: "price", helperText: "Enter price in this format: 123.45", startAdornment: "€", decimals: 2 }],
});
