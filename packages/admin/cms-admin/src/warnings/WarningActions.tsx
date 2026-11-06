import { messages, Tooltip } from "@dextinity/admin";
import { ArrowRight, OpenNewTab } from "@dextinity/admin-icons";
import { IconButton } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";

import type { ContentScope } from "../contentScope/Provider";
import { useWarningSourceUrl, type WarningSourceInfo } from "./useWarningSourceUrl";

interface Props {
    sourceInfo: WarningSourceInfo;
    scope?: ContentScope;
}

export function WarningActions({ sourceInfo, scope }: Props) {
    const history = useHistory();
    const loadUrl = useWarningSourceUrl(sourceInfo, scope);

    if (!loadUrl) {
        return null;
    } // to some warnings it cannot be linked to. When missing a dependency or for example a failing job cannot be resolved in the admin and therefore cannot have a link

    return (
        <div style={{ display: "flex" }}>
            <Tooltip title={<FormattedMessage {...messages.openInNewTab} />}>
                <IconButton
                    onClick={async () => {
                        const url = await loadUrl();
                        window.open(url, "_blank");
                    }}
                >
                    <OpenNewTab />
                </IconButton>
            </Tooltip>
            <Tooltip title={<FormattedMessage {...messages.openInThisTab} />}>
                <IconButton
                    onClick={async () => {
                        const url = await loadUrl();

                        history.push(url);
                    }}
                >
                    <ArrowRight />
                </IconButton>
            </Tooltip>
        </div>
    );
}
