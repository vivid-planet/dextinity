import { Accept, Copy } from "@dextinity/admin-icons";
// eslint-disable-next-line no-restricted-imports
import { Button, Dialog, Divider, List, ListItem, Stack, Typography } from "@mui/material";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { type JSX, type ReactNode, useEffect, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";

import { writeClipboardText } from "../../clipboard/writeClipboardText";
import { messages } from "../../messages";

export type ErrorType = "network" | "graphql" | "unauthorized" | "unauthenticated" | "unknown";

const errorTypeLabels: Record<ErrorType, ReactNode> = {
    graphql: <FormattedMessage id="dextinity.errorDialog.details.errorType.graphql" defaultMessage="Server error" />,
    network: <FormattedMessage id="dextinity.errorDialog.details.errorType.network" defaultMessage="Network error" />,
    unauthorized: <FormattedMessage id="dextinity.errorDialog.details.errorType.unauthorized" defaultMessage="Not authorized" />,
    unauthenticated: <FormattedMessage id="dextinity.errorDialog.details.errorType.unauthenticated" defaultMessage="Unauthenticated" />,
    unknown: <FormattedMessage id="dextinity.errorDialog.details.errorType.unknown" defaultMessage="Unknown error" />,
};

export interface ErrorDialogOptions {
    error: string | string[];
    title?: ReactNode;
    userMessage?: ReactNode;
    additionalInformation?: {
        errorType: ErrorType;
        httpStatus?: string;
        url: string;
        timestamp: string;
    };
}

export interface ErrorDialogProps {
    show?: boolean;
    onCloseClicked?: () => void;
    errorOptions?: ErrorDialogOptions;
}

export const ErrorDialog = ({ show = false, onCloseClicked, errorOptions }: ErrorDialogProps) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

    if (!errorOptions) {
        return null;
    }

    const { error, additionalInformation } = errorOptions;
    let { title, userMessage } = errorOptions;
    const errorType = additionalInformation?.errorType ?? "unknown";

    if (!title) {
        title = errorTypeLabels[errorType];
    }

    if (!userMessage) {
        if (errorType === "unauthenticated") {
            userMessage = <UnauthenticatedUserMessage />;
        } else if (errorType === "unauthorized") {
            userMessage = <UnauthorizedUserMessage error={error} />;
        } else {
            userMessage = <DefaultUserMessage error={error} additionalInformation={additionalInformation} />;
        }
    }
    return (
        <Dialog open={show} onClose={onCloseClicked} fullScreen={fullScreen} maxWidth="md">
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>{userMessage}</DialogContent>
            <DialogActions>
                <Button onClick={onCloseClicked} color="primary" variant="contained">
                    <FormattedMessage {...messages.ok} />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

type DefaultUserMessageProps = Pick<ErrorDialogOptions, "error" | "additionalInformation">;

function DefaultUserMessage({ error, additionalInformation }: DefaultUserMessageProps): JSX.Element {
    if (!Array.isArray(error)) {
        error = [error];
    }

    let copyData = `Error(s):\n${error.join("\n")}`;

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
            <Typography variant="h6">
                <FormattedMessage
                    id="dextinity.errorDialog.defaultUserMessage"
                    defaultMessage="The following {errorCount, plural, one {error} other {errors} } {errorCount, plural, one {has} other {have} } occurred:"
                    values={{ errorCount: error.length }}
                />
            </Typography>
            <Typography variant="list">
                {error.map((error) => (
                    <Typography variant="listItem" key={error}>
                        {error}
                    </Typography>
                ))}
            </Typography>
            <Typography gutterBottom>
                <FormattedMessage
                    id="dextinity.errorDialog.copyToClipboardInstruction"
                    defaultMessage="This information may prove useful for debugging the {errorCount, plural, one {error} other {errors} }. Please copy it and send it to your administrator."
                    values={{ errorCount: error.length }}
                />
            </Typography>
            <CopyToClipboardButton copyData={copyData} />
            {additionalInformation && (
                <>
                    <Divider sx={{ marginTop: 4, marginBottom: 4 }} />
                    <Typography component="p" variant="caption">
                        <strong>
                            <FormattedMessage id="dextinity.errorDialog.details" defaultMessage="Error details" />
                        </strong>
                    </Typography>
                    <Typography component="p" variant="caption">
                        <FormattedMessage
                            id="dextinity.errorDialog.details.errorType"
                            defaultMessage="Type: {errorType}"
                            values={{ errorType: errorTypeLabels[additionalInformation.errorType] }}
                        />
                    </Typography>
                    <Typography component="p" variant="caption">
                        <FormattedMessage
                            id="dextinity.errorDialog.details.httpStatus"
                            defaultMessage="HTTP status: {httpStatus}"
                            values={{ httpStatus: additionalInformation.httpStatus }}
                        />
                    </Typography>
                    <Typography component="p" variant="caption">
                        <FormattedMessage
                            id="dextinity.errorDialog.details.url"
                            defaultMessage="URL: {url}"
                            values={{ url: additionalInformation.url }}
                        />
                    </Typography>
                    <Typography component="p" variant="caption">
                        <FormattedMessage
                            id="dextinity.errorDialog.details.timestamp"
                            defaultMessage="Timestamp: {timeStamp}"
                            values={{ timeStamp: additionalInformation.timestamp }}
                        />
                    </Typography>
                </>
            )}
        </>
    );
}

function UnauthenticatedUserMessage(): JSX.Element {
    return (
        <>
            <Typography gutterBottom>
                <FormattedMessage id="dextinity.errorDialog.sessionExpired.message" defaultMessage="Your login-session has expired." />
            </Typography>
            <Button href="/" color="info" variant="outlined">
                <FormattedMessage id="dextinity.errorDialog.sessionExpired.button" defaultMessage="Re-login" />
            </Button>
        </>
    );
}

function UnauthorizedUserMessage({ error }: Pick<ErrorDialogOptions, "error">): JSX.Element {
    if (!Array.isArray(error)) {
        error = [error];
    }

    return (
        <>
            <Typography gutterBottom>
                <FormattedMessage id="dextinity.errorDialog.unauthorized.message" defaultMessage="You are not authorized to perform this action." />
            </Typography>
            <ErrorList>
                {error.map((error) => (
                    <ErrorListItem key={error}>{error}</ErrorListItem>
                ))}
            </ErrorList>
        </>
    );
}

const ErrorList = styled(List)`
    list-style-type: disc;
    padding-inline-start: ${({ theme }) => theme.spacing(6)};
`;

const ErrorListItem = styled(ListItem)`
    display: list-item;
    padding-left: 0;
`;

type CopyToClipboardButtonProps = {
    copyData: string;
};

function CopyToClipboardButton({ copyData }: CopyToClipboardButtonProps): JSX.Element {
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const timeoutID = useRef<number>(undefined);

    useEffect(() => {
        return () => {
            if (timeoutID.current) {
                window.clearTimeout(timeoutID.current);
            }
        };
    }, []);

    const handleCopyClick = () => {
        writeClipboardText(copyData);

        setShowSuccess(true);

        timeoutID.current = window.setTimeout(() => {
            setShowSuccess(false);
            timeoutID.current = undefined;
        }, 3000);
    };

    return (
        <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<Copy />} onClick={handleCopyClick}>
                <FormattedMessage id="dextinity.errorDialog.copyToClipboardButton.text" defaultMessage="Copy to clipboard" />
            </Button>
            {showSuccess && (
                <Typography variant="caption" sx={{ display: "inline-flex", alignItems: "center", gap: 1, color: "success.main" }}>
                    <Accept color="success" />
                    <FormattedMessage id="dextinity.errorDialog.copyToClipboardButton.success" defaultMessage="Copied" />
                </Typography>
            )}
        </Stack>
    );
}
