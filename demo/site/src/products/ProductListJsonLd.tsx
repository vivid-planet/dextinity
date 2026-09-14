import { JsonLd } from "@dextinity/site-nextjs";
import type { ItemList, WithContext } from "schema-dts";

interface Props {
    products: { title: string; url: string }[];
}

export function ProductListJsonLd({ products }: Props) {
    const data: WithContext<ItemList> = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: product.title,
            url: product.url,
        })),
    };

    return <JsonLd<ItemList> data={data} />;
}
