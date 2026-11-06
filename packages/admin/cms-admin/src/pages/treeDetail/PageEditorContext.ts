import { createContext, useContext } from "react";

import type { DocumentInterface } from "../../documents/types";
import type { GQLPageTreePageFragment } from "../pageTree/usePageTree";

export interface PageEditorContextValue {
    /** The page tree with this page selected and revealed, for the editor's back action. */
    backUrl: string;
    category: string;
    documentType: DocumentInterface;
    page: GQLPageTreePageFragment;
}

export const PageEditorContext = createContext<PageEditorContextValue | undefined>(undefined);

/**
 * The page being edited in the page editor of `PageTreeDetailPage`, so the editor can build its header (back action, page name, path).
 * `undefined` outside of it, e.g. when the editor is rendered by the legacy `PagesPage`.
 */
export function usePageEditorContext(): PageEditorContextValue | undefined {
    return useContext(PageEditorContext);
}
