import { createEntityMethods, DamImageBlock, type EntityInterface } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

export const ProductEntity: EntityInterface = {
    displayName: <FormattedMessage id="product.displayName" defaultMessage="Product" />,
    ...createEntityMethods({
        rootQueryName: "product",
        rootBlocks: { image: DamImageBlock },
        basePath: ({ id }) => `/products/${id}/edit`,
    }),
};
