import type { ContentScope } from "../../core/server/index.js";
import type { PageTreeNodeVisibility } from "./page-tree.schema.js";

export interface PageTreeNodeRecord {
    id: string;
    parentId: string | null;
    pos: number;
    name: string;
    slug: string;
    visibility: PageTreeNodeVisibility;
    documentType: string;
    category: string;
    hideInMenu: boolean;
    createdAt: Date;
    updatedAt: Date;
    scope: ContentScope;
}

export interface PageTreeNode extends PageTreeNodeRecord {
    /** `/` for the home page, otherwise the slugs of the ancestors and the node, e.g. `/products/shoes` */
    path: string;
}

export type SlugAvailability = "Available" | "Taken" | "Reserved";

export interface PageTreeDocument {
    type: string;
    data: Record<string, unknown>;
    updatedAt: Date;
}
