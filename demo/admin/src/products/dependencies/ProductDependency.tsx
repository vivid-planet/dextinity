import { createDependencyMethods, DamImageBlock, type DependencyInterface } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

export const ProductDependency: DependencyInterface = {
    displayName: <FormattedMessage id="product.displayName" defaultMessage="Product" />,
    ...createDependencyMethods({
        rootQueryName: "product",
        rootBlocks: { image: DamImageBlock },
        basePath: ({ id }) => `/products/${id}/edit`,
    }),
};
