import { gql } from "@dextinity/site-nextjs";
import { DamImageBlock } from "@src/common/blocks/DamImageBlock";

import type { GQLProductDetailContentFragment } from "./Content.generated";

export const productDetailContentFragment = gql`
    fragment ProductDetailContent on Product {
        title
        image
        description
    }
`;

type Props = {
    product: GQLProductDetailContentFragment;
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
