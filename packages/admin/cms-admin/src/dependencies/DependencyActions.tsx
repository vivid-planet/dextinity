import { messages } from "@dextinity/admin";
import { Icon, IconButton } from "@dextinity/ui";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory } from "react-router";

import { DependencyActionsRoot, DependencyActionsUnavailable } from "./DependencyActions.sc";
import { type DependencyTarget, useDependencyUrlResolver } from "./useDependencyUrlResolver";

const copiedFeedbackMs = 2000;

export const DependencyActions = (props: DependencyTarget) => {
    const intl = useIntl();
    const history = useHistory();
    const dependencyUrl = useDependencyUrlResolver()(props);
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

    return (
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
                    const url = await dependencyUrl.loadUrl?.();
                    if (url !== undefined) {
                        await navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
                        setIsCopied(true);
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
};
