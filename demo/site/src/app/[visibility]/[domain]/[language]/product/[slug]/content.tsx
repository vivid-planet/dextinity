"use client";

import { DamImageBlock } from "@src/common/blocks/DamImageBlock";

import type { GQLProductDetailPageFragment } from "./fragment.generated";

type Props = {
    product: GQLProductDetailPageFragment;
};
export function Content({ product }: Props) {
    return (
        <div>
            <DamImageBlock data={product.image} sizes="100vw" aspectRatio="16x9" />
            <h1>{product.title}</h1>
            {product.description && <p>{product.description}</p>}
        </div>
    );
}
