import { createDependencyMethods, type DependencyInterface } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

import { RedirectsLinkBlock } from "./RedirectsPage";

export const RedirectDependency: DependencyInterface = {
    displayName: <FormattedMessage id="redirect.displayName" defaultMessage="Redirect" />,
    ...createDependencyMethods({
        rootQueryName: "redirect",
        rootBlocks: {
            target: {
                block: RedirectsLinkBlock,
            },
        },
        basePath: ({ id }) => `/system/redirects/${id}/edit`,
    }),
};
