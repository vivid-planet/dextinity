import { messages } from "@dextinity/admin";
import { Icon, IconButton, Tooltip } from "@dextinity/ui";
import { type ReactNode, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory } from "react-router";

import { DependencyActionsRoot, DependencyActionsUnavailable, DependencyActionsUnavailableWrapper } from "./DependencyActions.sc";
import { type DependencyTarget, useDependencyUrlResolver } from "./useDependencyUrlResolver";

const copiedFeedbackMs = 2000;

interface DependencyActionsProps extends DependencyTarget {
    onCopyLinkError: () => void;
}

export const DependencyActions = ({ onCopyLinkError, ...target }: DependencyActionsProps) => {
    const intl = useIntl();
    const history = useHistory();
    const dependencyUrl = useDependencyUrlResolver()(target);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (!isCopied) {
            return;
        }
        const timeout = window.setTimeout(() => setIsCopied(false), copiedFeedbackMs);
        return () => window.clearTimeout(timeout);
    }, [isCopied]);

    if (dependencyUrl.status === "unknownType") {
        return (
            <DependencyActionsUnavailable>
                <FormattedMessage id="dextinity.dependencies.dataGrid.cannotLoadUrl" defaultMessage="Cannot determine URL" />
            </DependencyActionsUnavailable>
        );
    }

    const isScopeAllowed = dependencyUrl.status === "available";
    const scopeNotAllowedLabel = intl.formatMessage({
        id: "dextinity.dependencies.dataGrid.scopeNotAllowed",
        defaultMessage: "You don't have access to the scope of this item.",
    });

    const actions = (
        <DependencyActionsRoot>
            <IconButton
                aria-label={
                    isCopied
                        ? intl.formatMessage({ id: "dextinity.dependencies.dataGrid.linkCopied", defaultMessage: "Link copied" })
                        : isScopeAllowed
                          ? intl.formatMessage({ id: "dextinity.dependencies.dataGrid.copyLink", defaultMessage: "Copy link" })
                          : scopeNotAllowedLabel
                }
                variant="text"
                color="secondary"
                size="small"
                disabled={!isScopeAllowed}
                onClick={async () => {
                    try {
                        const url = await dependencyUrl.loadUrl?.();
                        if (url !== undefined) {
                            await navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
                            setIsCopied(true);
                        }
                    } catch {
                        onCopyLinkError();
                    }
                }}
            >
                <Icon name={isCopied ? "check" : "link"} />
            </IconButton>
            <IconButton
                aria-label={isScopeAllowed ? intl.formatMessage(messages.openInNewTab) : scopeNotAllowedLabel}
                variant="text"
                color="secondary"
                size="small"
                disabled={!isScopeAllowed}
                onClick={async () => {
                    const url = await dependencyUrl.loadUrl?.();
                    if (url !== undefined) {
                        window.open(url, "_blank");
                    }
                }}
            >
                <Icon name="open-new-tab" />
            </IconButton>
            <IconButton
                aria-label={isScopeAllowed ? intl.formatMessage(messages.openInThisTab) : scopeNotAllowedLabel}
                variant="text"
                color="secondary"
                size="small"
                disabled={!isScopeAllowed}
                onClick={async () => {
                    const url = await dependencyUrl.loadUrl?.();
                    if (url !== undefined) {
                        history.push(url);
                    }
                }}
            >
                <Icon name="arrow-right" />
            </IconButton>
        </DependencyActionsRoot>
    );

    return isScopeAllowed ? actions : <ScopeNotAllowedReason reason={scopeNotAllowedLabel}>{actions}</ScopeNotAllowedReason>;
};

// Disabled buttons receive neither hover nor focus, so the reason is shown on a focusable wrapper around them
function ScopeNotAllowedReason({ reason, children }: { reason: string; children: ReactNode }) {
    return (
        <Tooltip content={reason}>
            <DependencyActionsUnavailableWrapper tabIndex={0} role="note" aria-label={reason}>
                {children}
            </DependencyActionsUnavailableWrapper>
        </Tooltip>
    );
}
