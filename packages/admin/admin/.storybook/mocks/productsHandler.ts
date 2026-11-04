import { graphql, HttpResponse } from "msw";

import { type Manufacturer, manufacturers } from "./manufacturersHandler";

export type Product = { id: string; name: string; manufacturer: Manufacturer };

const products: Product[] = [
    { id: "1", name: "Widget A", manufacturer: manufacturers[0] },
    { id: "2", name: "Widget B", manufacturer: manufacturers[0] },
    { id: "3", name: "Vision Pro", manufacturer: manufacturers[1] },
    { id: "4", name: "Vision Lite", manufacturer: manufacturers[1] },
    { id: "5", name: "BuildKit X", manufacturer: manufacturers[2] },
    { id: "6", name: "BuildKit Y", manufacturer: manufacturers[2] },
    { id: "7", name: "NovaOne", manufacturer: manufacturers[3] },
    { id: "8", name: "NovaTwo", manufacturer: manufacturers[3] },
    { id: "9", name: "Apex Alpha", manufacturer: manufacturers[4] },
    { id: "10", name: "Apex Beta", manufacturer: manufacturers[4] },
];

export const productsQueryHandler = graphql.query<{ products: Product[] }, { manufacturer?: string }>("Products", ({ variables }) => {
    const manufacturerId = variables.manufacturer;
    return HttpResponse.json({
        data: {
            products: manufacturerId ? products.filter((p) => p.manufacturer.id === manufacturerId) : products,
        },
    });
});
