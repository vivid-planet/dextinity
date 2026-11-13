import { type ErrorDialogOptions, useErrorDialogState, writeClipboardText } from "@dextinity/admin";
import { Button, Dialog, Icon, KeyValueList, Typography } from "@dextinity/ui";
import { isValidElement, type ReactNode, useEffect, useRef, useState } from "react";
import { FormattedMessage, type MessageDescriptor, useIntl } from "react-intl";

import { AppFrameErrorDialogContent, AppFrameErrorList } from "./AppFrameErrorDialog.sc";

type ErrorType = NonNullable<ErrorDialogOptions["additionalInformation"]>["errorType"];

const closeAnimationDuration = 200;

function toErrorList(error: ErrorDialogOptions["error"]): string[] {
    return Array.isArray(error) ? error : [error];
}

/**
 * Shows the errors of `useErrorDialog` and of the Apollo link `createErrorDialogApolloLink` in a `Dialog` of `@dextinity/ui`, in place
 * of the MUI `ErrorDialogHandler`.
 */
export function AppFrameErrorDialog() {
    const intl = useIntl();
    const { errorOptions, clearError } = useErrorDialogState();
    const [open, setOpen] = useState(false);
    const clearTimeoutRef = useRef<number>(undefined);

    useEffect(() => {
        window.clearTimeout(clearTimeoutRef.current);
        setOpen(errorOptions != null);
    }, [errorOptions]);

    useEffect(() => () => window.clearTimeout(clearTimeoutRef.current), []);

    if (!errorOptions) {
        return null;
    }

    const errorTypeLabels: Record<ErrorType, string> = {
        graphql: intl.formatMessage({ id: "dextinity.errorDialog.details.errorType.graphql", defaultMessage: "Server error" }),
        network: intl.formatMessage({ id: "dextinity.errorDialog.details.errorType.network", defaultMessage: "Network error" }),
        unauthorized: intl.formatMessage({ id: "dextinity.errorDialog.details.errorType.unauthorized", defaultMessage: "Not authorized" }),
        unauthenticated: intl.formatMessage({ id: "dextinity.errorDialog.details.errorType.unauthenticated", defaultMessage: "Unauthenticated" }),
        unknown: intl.formatMessage({ id: "dextinity.errorDialog.details.errorType.unknown", defaultMessage: "Unknown error" }),
    };
    const { additionalInformation } = errorOptions;
    const errorType = additionalInformation?.errorType ?? "unknown";
    const title = getTitleText(errorOptions.title, intl.formatMessage) ?? errorTypeLabels[errorType];

    const close = () => {
        setOpen(false);
        clearTimeoutRef.current = window.setTimeout(clearError, closeAnimationDuration);
    };

    let content: ReactNode;
    if (errorOptions.userMessage) {
        content = <Typography variant="body">{errorOptions.userMessage}</Typography>;
    } else if (errorType === "unauthenticated") {
        content = (
            <Typography variant="body">
                <FormattedMessage id="dextinity.errorDialog.sessionExpired.message" defaultMessage="Your login-session has expired." />
            </Typography>
        );
    } else if (errorType === "unauthorized") {
        content = (
            <>
                <Typography variant="body">
                    <FormattedMessage
                        id="dextinity.errorDialog.unauthorized.message"
                        defaultMessage="You are not authorized to perform this action."
                    />
                </Typography>
                <ErrorList errors={toErrorList(errorOptions.error)} />
            </>
        );
    } else {
        content = <DefaultErrorContent errorOptions={errorOptions} errorTypeLabels={errorTypeLabels} />;
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    close();
                }
            }}
            title={title}
            role="alertdialog"
            labels={{ close: intl.formatMessage({ id: "dextinity.errorDialog.close", defaultMessage: "Close" }) }}
            footer={
                errorType === "unauthenticated" && !errorOptions.userMessage ? (
                    <Button href="/" startIcon={<Icon name="refresh" />}>
                        {intl.formatMessage({ id: "dextinity.errorDialog.sessionExpired.button", defaultMessage: "Re-login" })}
                    </Button>
                ) : (
                    <Button onClick={close}>{intl.formatMessage({ id: "dextinity.errorDialog.ok", defaultMessage: "OK" })}</Button>
                )
            }
        >
            <AppFrameErrorDialogContent>{content}</AppFrameErrorDialogContent>
        </Dialog>
    );
}

function getTitleText(title: ReactNode, formatMessage: (descriptor: MessageDescriptor, values?: Record<string, never>) => string) {
    if (typeof title === "string") {
        return title;
    }
    if (isValidElement<MessageDescriptor & { values?: Record<string, never> }>(title) && title.type === FormattedMessage) {
        return formatMessage(title.props, title.props.values);
    }
    return undefined;
}

function ErrorList({ errors }: { errors: string[] }) {
    return (
        <AppFrameErrorList>
            {errors.map((error) => (
                <li key={error}>
                    <Typography variant="body" element="span">
                        {error}
                    </Typography>
                </li>
            ))}
        </AppFrameErrorList>
    );
}

function DefaultErrorContent({ errorOptions, errorTypeLabels }: { errorOptions: ErrorDialogOptions; errorTypeLabels: Record<ErrorType, string> }) {
    const intl = useIntl();
    const [copied, setCopied] = useState(false);
    const errors = toErrorList(errorOptions.error);
    const { additionalInformation } = errorOptions;

    useEffect(() => {
        if (!copied) {
            return;
        }
        const timeoutId = window.setTimeout(() => setCopied(false), 3000);
        return () => window.clearTimeout(timeoutId);
    }, [copied]);

    let copyData = `Error(s):\n${errors.join("\n")}`;
    if (additionalInformation) {
        copyData += `\nError type: ${additionalInformation.errorType}\n`;
        if (additionalInformation.httpStatus) {
            copyData += `HTTP status: ${additionalInformation.httpStatus}\n`;
        }
        copyData += `URL: ${additionalInformation.url}\n`;
        copyData += `Timestamp: ${additionalInformation.timestamp}`;
    }

    return (
        <>
            <Typography variant="body">
                <FormattedMessage
                    id="dextinity.errorDialog.defaultUserMessage"
                    defaultMessage="The following {errorCount, plural, one {error} other {errors} } {errorCount, plural, one {has} other {have} } occurred:"
                    values={{ errorCount: errors.length }}
                />
            </Typography>
            <ErrorList errors={errors} />
            <Typography variant="small">
                <FormattedMessage
                    id="dextinity.errorDialog.copyToClipboardInstruction"
                    defaultMessage="This information may prove useful for debugging the {errorCount, plural, one {error} other {errors} }. Please copy it and send it to your administrator."
                    values={{ errorCount: errors.length }}
                />
            </Typography>
            <Button
                variant="outlined"
                color="secondary"
                startIcon={<Icon name={copied ? "check" : "copy"} />}
                onClick={() => {
                    writeClipboardText(copyData);
                    setCopied(true);
                }}
            >
                {copied
                    ? intl.formatMessage({ id: "dextinity.errorDialog.copyToClipboardButton.success", defaultMessage: "Copied" })
                    : intl.formatMessage({ id: "dextinity.errorDialog.copyToClipboardButton.text", defaultMessage: "Copy to clipboard" })}
            </Button>
            {additionalInformation && (
                <KeyValueList
                    aria-label={intl.formatMessage({ id: "dextinity.errorDialog.details", defaultMessage: "Error details" })}
                    items={[
                        {
                            key: intl.formatMessage({ id: "dextinity.errorDialog.details.type", defaultMessage: "Type" }),
                            value: errorTypeLabels[additionalInformation.errorType],
                        },
                        ...(additionalInformation.httpStatus
                            ? [
                                  {
                                      key: intl.formatMessage({ id: "dextinity.errorDialog.details.httpStatusLabel", defaultMessage: "HTTP status" }),
                                      value: additionalInformation.httpStatus,
                                  },
                              ]
                            : []),
                        {
                            key: intl.formatMessage({ id: "dextinity.errorDialog.details.urlLabel", defaultMessage: "URL" }),
                            value: additionalInformation.url,
                        },
                        {
                            key: intl.formatMessage({ id: "dextinity.errorDialog.details.timestampLabel", defaultMessage: "Timestamp" }),
                            value: additionalInformation.timestamp,
                        },
                    ]}
                />
            )}
        </>
    );
}
