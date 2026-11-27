import { Link } from "@dextinity/admin-icons";
import { createEntityMethods, type EntityInterface } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

import { RedirectsLinkBlock } from "./RedirectsPage";

export const RedirectEntity: EntityInterface = {
    displayName: <FormattedMessage id="redirect.displayName" defaultMessage="Redirect" />,
    icon: Link,
    ...createEntityMethods({
        rootQueryName: "redirect",
        rootBlocks: {
            target: {
                block: RedirectsLinkBlock,
            },
        },
        basePath: ({ id }) => `/system/redirects/${id}/edit`,
    }),
};
