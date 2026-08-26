"use client";
import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { ProductPriceBlockData } from "@src/blocks.generated";

export const ProductPriceBlock = withPreview(
    ({ data: { product } }: PropsWithData<ProductPriceBlockData>) => {
        if (!product) {
            return null;
        }

        return <strong>{product.price != null && `${product.price} €`}</strong>;
    },
    { label: "Product Price" },
);
