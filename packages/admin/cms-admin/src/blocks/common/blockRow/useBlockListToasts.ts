import { messages } from "@dextinity/admin";
import { useToasts, useUndoToast } from "@dextinity/ui";
import { useIntl } from "react-intl";

/** The toasts of a block list, for its `BlockRowList`: `perform` runs an action and offers to undo it. */
export function useBlockListToasts() {
    const intl = useIntl();
    const { toasts, add, dismiss } = useToasts();
    const { perform } = useUndoToast({ addToast: add, labels: { undo: intl.formatMessage(messages.undo) } });

    return { toasts, dismissToast: dismiss, perform };
}
