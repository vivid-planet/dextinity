import type { Block } from "../../blocks/server/index.js";

export interface PageTreeDocumentTypeConfig {
    /** The root blocks of the document, e.g. `{ content: PageContentBlock, seo: SeoBlock }`. A document stores the input of each. */
    rootBlocks: Record<string, Block>;
}

export interface PageTreeConfig {
    /** The trees of the application, e.g. `["mainNavigation", "topMenu"]` */
    categories: readonly [string, ...string[]];
    /** The document types a node can have, e.g. `{ Page: { rootBlocks: { … } }, Link: { rootBlocks: { … } } }` */
    documentTypes: Record<string, PageTreeDocumentTypeConfig>;
    /** Paths no page may have, e.g. routes of the site. Defaults to `/admin` and `/preview`. */
    reservedPaths?: string[];
}

export const homeSlug = "home";

export const defaultReservedPaths = ["/admin", "/preview"];
