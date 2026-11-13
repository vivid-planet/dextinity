import { useIntl } from "react-intl";

export function useImpersonationMessages() {
    const intl = useIntl();
    return {
        startImpersonation: intl.formatMessage({ id: "dextinity.generic.startImpersonation", defaultMessage: "Start Impersonation" }),
        stopImpersonation: intl.formatMessage({ id: "dextinity.generic.stopImpersonation", defaultMessage: "Regain original identity" }),
        cannotImpersonateYourself: intl.formatMessage({
            id: "dextinity.userPermissions.cannotImpersonateYourself",
            defaultMessage: "Cannot impersonate yourself",
        }),
        evaluatingPermissions: intl.formatMessage({
            id: "dextinity.userPermissions.evaluatingPermissions",
            defaultMessage: "Evaluating permissions",
        }),
    };
}
