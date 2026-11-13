import { useIntl } from "react-intl";

export function useAssignmentTypeLabels() {
    const intl = useIntl();
    return {
        header: intl.formatMessage({ id: "dextinity.userPermissions.source", defaultMessage: "Assignment type" }),
        byRule: intl.formatMessage({ id: "dextinity.userPermissions.assignmentType.byRule", defaultMessage: "By rule" }),
        manual: intl.formatMessage({ id: "dextinity.userPermissions.assignmentType.manual", defaultMessage: "Manual" }),
    };
}
