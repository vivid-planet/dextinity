import { Button, EmptyState, Icon } from "@dextinity/ui";
import { FormattedMessage, useIntl } from "react-intl";

interface LoadErrorProps {
    onRetry: () => void;
}

export function LoadError({ onRetry }: LoadErrorProps) {
    const intl = useIntl();

    return (
        <EmptyState
            icon={<Icon name="alert" />}
            title={intl.formatMessage({ id: "overview.loadError.title", defaultMessage: "Couldn't load" })}
            description={intl.formatMessage({
                id: "overview.loadError.description",
                defaultMessage: "The server didn't answer. Your content is not affected.",
            })}
            actions={
                <Button variant="outlined" color="secondary" size="small" startIcon={<Icon name="refresh" />} onClick={onRetry}>
                    <FormattedMessage id="overview.loadError.retry" defaultMessage="Load again" />
                </Button>
            }
        />
    );
}
