import type { DocumentNode } from "graphql";

import { useDextinityConfig } from "../config/DextinityConfigContext";
import type { DocumentInterface, DocumentType } from "../documents/types";
import type { AllCategories } from "./pageTree/PageTreeContext";

export interface PageTreeConfig {
    categories: AllCategories;
    documentTypes: Record<DocumentType, DocumentInterface>;
    additionalPageTreeNodeFragment?: {
        name: string;
        fragment: DocumentNode;
    };
    scopeParts?: string[];
    /**
     * Controls whether delete actions are shown in the page tree UI.
     * Defaults to `true` when not set.
     */
    allowPageDelete?: boolean;
    /**
     * The path of the page tree of a category below the content scope, where the project mounts `PagesPage`, e.g. `/pages/pagetree/main-navigation`.
     * The AI Mode needs it to open a page's editor from any page.
     */
    getBasePath?: (category: string) => string;
}

export function usePageTreeConfig(): PageTreeConfig {
    const dextinityConfig = useDextinityConfig();

    if (!dextinityConfig.pageTree) {
        throw new Error("No page tree configuration found. Make sure to set `pageTree` in `DextinityConfigProvider`.");
    }

    return dextinityConfig.pageTree;
}
