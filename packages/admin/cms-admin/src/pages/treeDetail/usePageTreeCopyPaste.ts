import { useState } from "react";

import { type PagesClipboard, type PastePagesProgress, useCopyPastePages } from "../pageTree/useCopyPastePages";
import type { GQLPageTreePageFragment } from "../pageTree/usePageTree";
import { getSubtree, getTopmostPageIds, type PageTreeStructure } from "./pageTreeStructure";

export type PastePosition = "after" | "inside";

interface UsePageTreeCopyPasteOptions {
    structure: PageTreeStructure;
    category: string;
    onPasteError: (error: unknown) => void;
}

/**
 * Copies pages with their subpages to the clipboard and pastes them, also into another content scope, and duplicates them.
 */
export function usePageTreeCopyPaste({ structure, category, onPasteError }: UsePageTreeCopyPasteOptions) {
    const { prepareForClipboard, writeToClipboard, getFromClipboard, sendPages, progress } = useCopyPastePages({ onPasteError, category });
    const pasteProgress: PastePagesProgress | undefined = progress;
    const [clipboard, setClipboard] = useState<PagesClipboard>();

    const prepareSubtrees = (pageIds: string[]) => {
        const pages = getTopmostPageIds(structure, pageIds).flatMap((id) => {
            const page = structure.pagesById.get(id);
            return page != null ? getSubtree(structure, page).map((subpage) => (subpage === page ? { ...page, parentId: null } : subpage)) : [];
        });
        return prepareForClipboard(pages);
    };

    const copyPages = async (pageIds: string[]) => {
        const pagesClipboard = await prepareSubtrees(pageIds);
        await writeToClipboard(pagesClipboard);
        setClipboard(pagesClipboard);
        return pagesClipboard.pages.length;
    };

    /** Reads the clipboard, e.g. when a menu opens, so paste can be offered only when there are pages to paste. */
    const readClipboard = async () => {
        const result = await getFromClipboard();
        const pagesClipboard = result.canPaste && result.content.pages.length > 0 ? result.content : undefined;
        setClipboard(pagesClipboard);
        return pagesClipboard;
    };

    const pasteTo = (target: GQLPageTreePageFragment, position: PastePosition, pagesClipboard: PagesClipboard) =>
        position === "inside" ? sendPages(target.id, pagesClipboard, {}) : sendPages(target.parentId, pagesClipboard, { targetPos: target.pos + 1 });

    const pastePages = async (target: GQLPageTreePageFragment, position: PastePosition) => {
        const pagesClipboard = await readClipboard();
        if (pagesClipboard == null || !(await pasteTo(target, position, pagesClipboard))) {
            return 0;
        }
        return pagesClipboard.pages.length;
    };

    const duplicatePage = async (page: GQLPageTreePageFragment) => {
        const pagesClipboard = await prepareSubtrees([page.id]);
        return pasteTo(page, "after", pagesClipboard);
    };

    /** Duplicates each page next to itself, starting with the last one so that the earlier pages keep their positions. */
    const duplicatePages = async (pages: GQLPageTreePageFragment[]) => {
        let duplicatedCount = 0;
        for (const page of [...pages].sort((pageA, pageB) => pageB.pos - pageA.pos)) {
            if (await duplicatePage(page)) {
                duplicatedCount++;
            }
        }
        return duplicatedCount;
    };

    return { copyPages, readClipboard, hasClipboardPages: clipboard != null, pastePages, duplicatePage, duplicatePages, progress: pasteProgress };
}
