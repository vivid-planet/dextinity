import { generateImageUrl, gql, JsonLd } from "@dextinity/site-nextjs";
import type { DamImageBlockData } from "@src/blocks.generated";
import type { ContentScope } from "@src/site-configs";
import { createSitePath } from "@src/util/createSitePath";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import type { AggregateOffer, ItemAvailability, Offer, Product, WithContext } from "schema-dts";

import type { GQLProductJsonLdFragment } from "./ProductJsonLd.generated";

export const productJsonLdFragment = gql`
    fragment ProductJsonLd on Product {
        title
        slug
        description
        image
        articleNumbers
        inStock
        price
        priceRange {
            min
            max
        }
        manufacturer {
            name
        }
        category {
            title
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

// TODO: Read the currency from the site config once it carries one; the Demo only sells in EUR.
const priceCurrency = "EUR";

function productOffers(product: GQLProductJsonLdFragment, url: string): Offer | AggregateOffer | undefined {
    const availability: ItemAvailability = product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

    if (product.price != null) {
        return { "@type": "Offer", price: product.price, priceCurrency, availability, url };
    }

    if (product.priceRange) {
        return {
            "@type": "AggregateOffer",
            lowPrice: product.priceRange.min,
            highPrice: product.priceRange.max,
            priceCurrency,
            availability,
            url,
        };
    }

    return undefined;
}

export function ProductJsonLd({ product, scope }: Props) {
    const siteConfig = getSiteConfigForDomain(scope.domain);
    const url = new URL(createSitePath({ scope, path: `/product/${product.slug}` }), siteConfig.url).toString();
    const image = productImageUrl(product.image, siteConfig.url);
    const offers = productOffers(product, url);

    const data: WithContext<Product> = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        url,
        ...(image ? { image } : {}),
        ...(product.description ? { description: product.description } : {}),
        ...(product.articleNumbers[0] ? { sku: product.articleNumbers[0] } : {}),
        ...(product.manufacturer ? { brand: { "@type": "Brand", name: product.manufacturer.name } } : {}),
        ...(product.category ? { category: product.category.title } : {}),
        ...(offers ? { offers } : {}),
    };

    return <JsonLd<Product> data={data} />;
}
