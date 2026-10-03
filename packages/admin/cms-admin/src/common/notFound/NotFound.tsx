import { FullPageAlert, type FullPageAlertProps } from "@comet/admin";
import type { FunctionComponent } from "react";
import { FormattedMessage } from "react-intl";

export type NotFoundProps = FullPageAlertProps;

export const NotFound: FunctionComponent<NotFoundProps> = (props) => {
    return (
        <FullPageAlert
            title={<FormattedMessage id="comet.notFound.title" defaultMessage="Page not found (404)" />}
            description={<FormattedMessage id="comet.notFound.description" defaultMessage="The requested page does not exist or has been moved." />}
            {...props}
        />
    );
};
