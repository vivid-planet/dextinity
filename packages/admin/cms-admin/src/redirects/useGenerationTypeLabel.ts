import { useCallback } from "react";
import { useIntl } from "react-intl";

import type { GQLRedirectGenerationType } from "../graphql.generated";

export function useGenerationTypeLabel(): (generationType: GQLRedirectGenerationType) => string {
    const intl = useIntl();
    return useCallback(
        (generationType) =>
            generationType === "automatic"
                ? intl.formatMessage({ id: "dextinity.redirects.redirect.generationType.automatic", defaultMessage: "Automatic" })
                : intl.formatMessage({ id: "dextinity.redirects.redirect.generationType.manual", defaultMessage: "Manual" }),
        [intl],
    );
}
