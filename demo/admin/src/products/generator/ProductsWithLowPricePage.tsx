import { MainContent } from "@dextinity/admin";

import { ProductsGrid } from "./generated/ProductsGrid";

export function ProductsWithLowPricePage() {
    // This grid needs no add or edit-button
    return (
        <MainContent fullHeight>
            <ProductsGrid filter={{ price: { lowerThan: 10 } }} actionsColumnWidth={84} />
        </MainContent>
    );
}
