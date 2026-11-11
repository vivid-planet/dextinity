import { useCallback } from "react";
import { useIntl } from "react-intl";

import type { GQLRedirectType } from "../graphql.generated";

export function useRedirectTypeLabel(): (redirectType: GQLRedirectType) => string {
    const intl = useIntl();
    return useCallback(
        (redirectType) =>
            redirectType === "permanent"
                ? intl.formatMessage({ id: "dextinity.pages.redirects.redirect.redirectType.permanent", defaultMessage: "Permanent" })
                : intl.formatMessage({ id: "dextinity.pages.redirects.redirect.redirectType.temporary", defaultMessage: "Standard" }),
        [intl],
    );
}
