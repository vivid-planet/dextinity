import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { ProductTypesBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";

export const ProductTypesBlock = withPreview(
    ({ data: { types } }: PropsWithData<ProductTypesBlockData>) => {
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
        label: "ProductTypes",
    },
);
