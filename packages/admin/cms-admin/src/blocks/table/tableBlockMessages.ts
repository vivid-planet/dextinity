import { useIntl } from "react-intl";

export function useTableBlockMessages() {
    const intl = useIntl();

    return {
        removeHighlighting: intl.formatMessage({ id: "dextinity.tableBlock.removeHighlighting", defaultMessage: "Remove highlighting" }),
        failedToPaste: intl.formatMessage({
            id: "dextinity.tableBlock.couldNotPasteClipboardData",
            defaultMessage: "Could not paste the clipboard data",
        }),
    };
}
