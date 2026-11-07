import { StatusIndicator } from "@dextinity/ui";
import { useIntl } from "react-intl";

export function ContactStatus({ blocked }: { blocked: boolean }) {
    const intl = useIntl();
    return blocked ? (
        <StatusIndicator status="critical">
            {intl.formatMessage({ id: "dextinity.brevoContact.status.blocked", defaultMessage: "Blocked" })}
        </StatusIndicator>
    ) : (
        <StatusIndicator status="published">
            {intl.formatMessage({ id: "dextinity.brevoContact.status.subscribed", defaultMessage: "Subscribed" })}
        </StatusIndicator>
    );
}
