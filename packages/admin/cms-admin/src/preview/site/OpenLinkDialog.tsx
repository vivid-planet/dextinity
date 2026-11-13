import { messages } from "@dextinity/admin";
import { ConfirmDialog, Icon } from "@dextinity/ui";
import { useIntl } from "react-intl";

import type { ExternalLinkBlockData } from "../../blocks.generated";

interface OpenLinkDialogProps {
    onClose: () => void;
    open: boolean;
    link?: ExternalLinkBlockData;
}

function OpenLinkDialog({ open, onClose, link }: OpenLinkDialogProps) {
    const intl = useIntl();

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    onClose();
                }
            }}
            title={intl.formatMessage({ id: "dextinity.preview.openLink.question", defaultMessage: "Open the external link?" })}
            description={intl.formatMessage(
                {
                    id: "dextinity.preview.openLink.newTab",
                    defaultMessage: "{url} opens in a new browser tab.",
                },
                { url: link?.targetUrl },
            )}
            confirmLabel={intl.formatMessage({ id: "dextinity.openLinkDialog.actionButtons.open", defaultMessage: "Open" })}
            confirmIcon={<Icon name="window" />}
            onConfirm={() => {
                onClose();
                window.open(link?.targetUrl, "_blank", "noopener,noreferrer");
            }}
            labels={{ cancel: intl.formatMessage(messages.cancel) }}
        />
    );
}

export { OpenLinkDialog };
