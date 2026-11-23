import { useMemo } from "react";
import { useIntl } from "react-intl";

import type { GQLActionLogType } from "../../../graphql.generated";

export function useActionLogTypeValueOptions(): Array<{ value: GQLActionLogType; label: string }> {
    const intl = useIntl();
    return useMemo(
        () => [
            { value: "created", label: intl.formatMessage({ id: "actionLog.actionLogTypeChip.created", defaultMessage: "Created" }) },
            { value: "updated", label: intl.formatMessage({ id: "actionLog.actionLogTypeChip.updated", defaultMessage: "Updated" }) },
            { value: "deleted", label: intl.formatMessage({ id: "actionLog.actionLogTypeChip.deleted", defaultMessage: "Deleted" }) },
        ],
        [intl],
    );
}
