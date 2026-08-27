"use client";
import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { ProductTeaserBlockData } from "@src/blocks.generated";

import type { LoadedData } from "./ProductTeaserBlock.loader";

export const ProductTeaserBlock = withPreview(
    ({ data: { loaded } }: PropsWithData<ProductTeaserBlockData & { loaded: LoadedData }>) => {
        if (!loaded) {
            return null;
        }

        return (
            <div>
                <h3>{loaded.title}</h3>
                {loaded.description && <p>{loaded.description}</p>}
                {loaded.price != null && <strong>{loaded.price} €</strong>}
            </div>
        );
    },
    { label: "Product Teaser" },
);
