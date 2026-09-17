import { createCompositeBlock, createCompositeBlockSelectField } from "@dextinity/cms-admin";
import type { ProductTypesBlockData } from "@src/blocks.generated";
import type { JSX } from "react";
import { FormattedMessage } from "react-intl";

const options: { value: ProductTypesBlockData["types"][number]; label: JSX.Element }[] = [
    {
        value: "cap",
        label: <FormattedMessage id="cap" defaultMessage="Cap" />,
    },
    {
        value: "shirt",
        label: <FormattedMessage id="shirt" defaultMessage="Shirt" />,
    },
    {
        value: "tie",
        label: <FormattedMessage id="tie" defaultMessage="Tie" />,
    },
];

export const ProductTypesBlock = createCompositeBlock({
    name: "ProductTypes",
    displayName: <FormattedMessage id="productTypesBlock.displayName" defaultMessage="Product Types" />,
    blocks: {
        types: {
            block: createCompositeBlockSelectField<ProductTypesBlockData["types"]>({
                defaultValue: ["cap"],
                label: <FormattedMessage id="productTypesBlock.products" defaultMessage="Products" />,
                options: options,
                multiple: true,
                fullWidth: true,
            }),
        },
    },
});
