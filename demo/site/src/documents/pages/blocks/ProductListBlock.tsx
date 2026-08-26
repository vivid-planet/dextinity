import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { ProductListBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";

export const ProductListBlock = withPreview(
    ({ data: { types } }: PropsWithData<ProductListBlockData>) => {
        return (
            <PageLayout grid>
                <ul>
                    {types.map((type, index) => (
                        <li key={index}>{type}</li>
                    ))}
                </ul>
            </PageLayout>
        );
    },
    {
        label: "ProductList",
    },
);
