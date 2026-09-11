import { generateImageUrl, gql, JsonLd } from "@dextinity/site-nextjs";
import type { DamImageBlockData } from "@src/blocks.generated";
import type { ContentScope } from "@src/site-configs";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import type { Product, WithContext } from "schema-dts";

import type { GQLProductJsonLdFragment } from "./ProductJsonLd.generated";

export const productJsonLdFragment = gql`
    fragment ProductJsonLd on Product {
        title
        description
        image
        articleNumbers
        inStock
        price
        priceRange {
            min
        }
        manufacturer {
            name
        }
    }
`;

interface Props {
    product: GQLProductJsonLdFragment;
    scope: ContentScope;
}

const maxWidth = 1200;

function productImageUrl(image: DamImageBlockData, siteUrl: string): string | undefined {
    const props = image.block?.props;

    if (!props) {
        return undefined;
    }

    if ("urlTemplate" in props && props.damFile?.image) {
        const width = Math.min(props.damFile.image.width, maxWidth);
        const aspectRatio = props.damFile.image.width / props.damFile.image.height;
        return new URL(generateImageUrl({ src: props.urlTemplate, width }, aspectRatio), siteUrl).toString();
    }

    return props.damFile?.fileUrl ? new URL(props.damFile.fileUrl, siteUrl).toString() : undefined;
}

export function ProductJsonLd({ product, scope }: Props) {
    const siteConfig = getSiteConfigForDomain(scope.domain);
    const image = productImageUrl(product.image, siteConfig.url);
    const price = product.price ?? product.priceRange?.min;

    const data: WithContext<Product> = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        ...(image ? { image } : {}),
        ...(product.description ? { description: product.description } : {}),
        ...(product.articleNumbers[0] ? { sku: product.articleNumbers[0] } : {}),
        ...(product.manufacturer ? { brand: { "@type": "Brand", name: product.manufacturer.name } } : {}),
        ...(price != null
            ? {
                  offers: {
                      "@type": "Offer",
                      price,
                      // TODO: Read the currency from the site config once it carries one; the Demo only sells in EUR.
                      priceCurrency: "EUR",
                      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                  },
              }
            : {}),
    };

    return <JsonLd<Product> data={data} />;
}
