"use client";
import type { PropsWithData } from "@dextinity/site-nextjs";
import type { ProductDetailBlockData } from "@src/blocks.generated";
import type { JSX, PropsWithChildren } from "react";

import type { LoadedData } from "./ProductDetailBlock.loader";

function ProductDetailBlock({
    data: { id, loaded },
}: PropsWithChildren<PropsWithData<ProductDetailBlockData & { loaded: LoadedData }>>): JSX.Element | null {
    if (id === undefined || !loaded) {
        return null;
    }

    return (
        <div>
            <h1>Product #{id}</h1>
            <p>{loaded.title}</p>
        </div>
    );
}

export { ProductDetailBlock };
