import type { StatusIndicatorLabels, StatusIndicatorStatus } from "@dextinity/ui";
import { useIntl } from "react-intl";

import type { GQLPageTreeNodeVisibility } from "../../graphql.generated";

export const visibilityStatus: Record<GQLPageTreeNodeVisibility, StatusIndicatorStatus> = {
    Published: "published",
    Unpublished: "unpublished",
    Archived: "archived",
};

export function usePageTreeStatusLabels(): Pick<StatusIndicatorLabels, "published" | "unpublished" | "archived"> {
    const intl = useIntl();
    return {
        published: intl.formatMessage({ id: "dextinity.pageTreeDetail.status.published", defaultMessage: "Published" }),
        unpublished: intl.formatMessage({ id: "dextinity.pageTreeDetail.status.unpublished", defaultMessage: "Unpublished" }),
        archived: intl.formatMessage({ id: "dextinity.pageTreeDetail.status.archived", defaultMessage: "Archived" }),
    };
}
