import { createEntityMethods, type EntityInterface } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

export const ManufacturerEntity: EntityInterface = {
    displayName: <FormattedMessage id="manufacturer.displayName" defaultMessage="Manufacturer" />,
    ...createEntityMethods({
        rootQueryName: "manufacturer",
        rootBlocks: {},
        basePath: ({ id }) => `/manufacturers/${id}/edit`,
    }),
};
