import type { BlockLabels } from "@dextinity/ui";
import { useIntl } from "react-intl";

export function useBlockRowLabels() {
    const intl = useIntl();

    const block: BlockLabels = {
        move: intl.formatMessage({ id: "dextinity.blocks.blockRow.move", defaultMessage: "Move" }),
        hide: intl.formatMessage({ id: "dextinity.blocks.blockRow.hide", defaultMessage: "Hide" }),
        hidden: intl.formatMessage({ id: "dextinity.blocks.blockRow.hidden", defaultMessage: "Hidden" }),
        toggleFields: intl.formatMessage({ id: "dextinity.blocks.blockRow.toggleFields", defaultMessage: "Fields" }),
        select: intl.formatMessage({ id: "dextinity.blocks.blockRow.select", defaultMessage: "Select" }),
        invalid: intl.formatMessage({ id: "dextinity.blocks.blockRow.invalid", defaultMessage: "Contains errors" }),
    };

    return {
        block,
        moreActions: intl.formatMessage({ id: "dextinity.blocks.blockRow.moreActions", defaultMessage: "More actions" }),
        pasteBelow: intl.formatMessage({ id: "dextinity.blocks.blockRow.pasteBelow", defaultMessage: "Paste below" }),
        duplicate: intl.formatMessage({ id: "dextinity.blocks.blockRow.duplicate", defaultMessage: "Duplicate" }),
    };
}
