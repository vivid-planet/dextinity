import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { ProductListBlockData } from "@src/blocks.generated";
import Link from "next/link";

import type { LoadedData } from "./ProductListBlock.loader";

export const ProductListBlock = withPreview(
    ({ data: { loaded: products } }: PropsWithData<ProductListBlockData & { loaded: LoadedData }>) => {
        if (products.length === 0) {
            return null;
        }

        return (
            <ol>
                {products.map((product) => (
                    <li key={product.id}>
                        <Link href={product.path}>{product.title}</Link>
                    </li>
                ))}
            </ol>
        );
    },
    { label: "Product List" },
);
