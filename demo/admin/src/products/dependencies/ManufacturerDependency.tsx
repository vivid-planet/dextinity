import { createDependencyMethods, type DependencyInterface } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

export const ManufacturerDependency: DependencyInterface = {
    displayName: <FormattedMessage id="manufacturer.displayName" defaultMessage="Manufacturer" />,
    ...createDependencyMethods({
        rootQueryName: "manufacturer",
        rootBlocks: {},
        basePath: ({ id }) => `/manufacturers/${id}/edit`,
    }),
};
