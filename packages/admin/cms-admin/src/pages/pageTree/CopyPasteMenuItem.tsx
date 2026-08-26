import { RowActionsItem } from "@dextinity/admin";
import { Copy, Paste } from "@dextinity/admin-icons";
import { FormattedMessage } from "react-intl";

import { subTreeFromNode, treeMapToArray } from "./treemap/TreeMapUtils";
import { useCopyPastePages } from "./useCopyPastePages";
import type { PageTreePage } from "./usePageTree";
import { usePageTreeContext } from "./usePageTreeContext";

interface Props {
    page: PageTreePage;
}

export const CopyPasteMenuItem = ({ page }: Props) => {
    const { prepareForClipboard, writeToClipboard, getFromClipboard, sendPages, progressDialog } = useCopyPastePages();
    const { tree } = usePageTreeContext();

    return (
        <>
            {progressDialog}
            <RowActionsItem
                icon={<Copy />}
                onClick={async () => {
                    const subTree = subTreeFromNode(page, tree);
                    const pagesAsArray = treeMapToArray(subTree, "root");
                    const pagesClipboard = await prepareForClipboard(pagesAsArray);
                    await writeToClipboard(pagesClipboard);
                }}
            >
                <FormattedMessage id="dextinity.pages.pages.page.copy" defaultMessage="Copy" />
            </RowActionsItem>
            <RowActionsItem
                icon={<Paste />}
                onClick={async () => {
                    const pages = await getFromClipboard();
                    if (pages.canPaste) {
                        await sendPages(page.parentId, pages.content, { targetPos: page.pos + 1 });
                    }
                }}
            >
                <FormattedMessage id="dextinity.pages.pages.page.paste" defaultMessage="Paste" />
            </RowActionsItem>
        </>
    );
};
