import { useErrorHandler } from "@dextinity/admin";
import { Button, EmptyState, Icon, LogViewer } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { Component, type ErrorInfo, type ReactNode, useState } from "react";
import { useIntl } from "react-intl";

export interface ContentErrorBoundaryProps {
    children?: ReactNode;
    /** Replaces the default "Something went wrong" title. */
    title?: string;
    /** Replaces the default description below the title. */
    description?: string;
    /** Shows the error and the component stack below the actions. Defaults to `true` in development only. */
    showDetails?: boolean;
}

interface CaughtError {
    error: Error;
    errorInfo: ErrorInfo;
}

/**
 * Catches errors while rendering its children and shows them as an empty state with "Try again" instead of a broken
 * screen. Errors are reported to the `ErrorHandlerProvider` of `@dextinity/admin`.
 */
export function ContentErrorBoundary({
    children,
    showDetails = process.env.NODE_ENV === "development",
    ...fallbackProps
}: ContentErrorBoundaryProps) {
    const { onError } = useErrorHandler();
    return (
        <CatchingBoundary
            onError={onError}
            renderFallback={(caught, reset) => <ErrorFallback {...fallbackProps} caught={caught} showDetails={showDetails} onRetry={reset} />}
        >
            {children}
        </CatchingBoundary>
    );
}

interface CatchingBoundaryProps {
    children?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    renderFallback: (caught: CaughtError, reset: () => void) => ReactNode;
}

class CatchingBoundary extends Component<CatchingBoundaryProps, { caught?: CaughtError }> {
    state: { caught?: CaughtError } = {};

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ caught: { error, errorInfo } });
        this.props.onError?.(error, errorInfo);
    }

    reset = () => {
        this.setState({ caught: undefined });
    };

    render() {
        if (this.state.caught) {
            return this.props.renderFallback(this.state.caught, this.reset);
        }
        return this.props.children;
    }
}

interface ErrorFallbackProps extends Omit<ContentErrorBoundaryProps, "children"> {
    caught: CaughtError;
    onRetry: () => void;
}

function ErrorFallback({ caught, title, description, showDetails, onRetry }: ErrorFallbackProps) {
    const intl = useIntl();
    const [detailsOpen, setDetailsOpen] = useState(false);
    const { error, errorInfo } = caught;

    return (
        <Root role="alert">
            <EmptyState
                icon={<Icon name="error" />}
                title={title ?? intl.formatMessage({ id: "dextinity.errorBoundary.title", defaultMessage: "Something went wrong" })}
                description={
                    description ??
                    intl.formatMessage({
                        id: "dextinity.errorBoundary.description",
                        defaultMessage: "This part of the page could not be shown. Try again, or reload the page if the error persists.",
                    })
                }
                actions={
                    <>
                        <Button variant="contained" color="primary" startIcon={<Icon name="reload" />} onClick={onRetry}>
                            {intl.formatMessage({ id: "dextinity.errorBoundary.retry", defaultMessage: "Try again" })}
                        </Button>
                        {showDetails && (
                            <Button variant="text" color="secondary" aria-expanded={detailsOpen} onClick={() => setDetailsOpen((open) => !open)}>
                                {detailsOpen
                                    ? intl.formatMessage({ id: "dextinity.errorBoundary.hideDetails", defaultMessage: "Hide details" })
                                    : intl.formatMessage({ id: "dextinity.errorBoundary.showDetails", defaultMessage: "Show details" })}
                            </Button>
                        )}
                    </>
                }
            />
            {showDetails && detailsOpen && (
                <Details
                    content={[error.stack ?? error.toString(), errorInfo.componentStack?.trim()].filter(Boolean).join("\n\n")}
                    title={error.toString()}
                    wrap
                    labels={{
                        log: intl.formatMessage({ id: "dextinity.errorBoundary.details", defaultMessage: "Error details" }),
                        copy: intl.formatMessage({ id: "dextinity.errorBoundary.copyDetails", defaultMessage: "Copy details" }),
                        copied: intl.formatMessage({ id: "dextinity.errorBoundary.copied", defaultMessage: "Copied" }),
                    }}
                />
            )}
        </Root>
    );
}

const Root = styled("div")`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--dextinity-space-4);
    box-sizing: border-box;
    inline-size: 100%;
    padding: var(--dextinity-space-6) var(--dextinity-space-4);
`;

const Details = styled(LogViewer)`
    inline-size: 100%;
    max-inline-size: 960px;
    max-block-size: 480px;
`;
