import type { GQLPageTreePageFragment } from "../pageTree/usePageTree";

export interface PageTreeStructure {
    pagesById: Map<string, GQLPageTreePageFragment>;
    childrenByParentId: Map<string | null, GQLPageTreePageFragment[]>;
}

export function createPageTreeStructure(pages: GQLPageTreePageFragment[]): PageTreeStructure {
    const pagesById = new Map(pages.map((page) => [page.id, page]));
    const childrenByParentId = new Map<string | null, GQLPageTreePageFragment[]>();
    for (const page of [...pages].sort((pageA, pageB) => pageA.pos - pageB.pos)) {
        const siblings = childrenByParentId.get(page.parentId) ?? [];
        siblings.push(page);
        childrenByParentId.set(page.parentId, siblings);
    }
    return { pagesById, childrenByParentId };
}

export function isHomePage(page: GQLPageTreePageFragment) {
    return page.slug === "home";
}

export function getAncestorIds({ pagesById }: PageTreeStructure, pageId: string): string[] {
    const ancestorIds: string[] = [];
    let parentId = pagesById.get(pageId)?.parentId ?? null;
    while (parentId != null) {
        ancestorIds.push(parentId);
        parentId = pagesById.get(parentId)?.parentId ?? null;
    }
    return ancestorIds;
}

export function getSubtree(structure: PageTreeStructure, page: GQLPageTreePageFragment): GQLPageTreePageFragment[] {
    const children = structure.childrenByParentId.get(page.id) ?? [];
    return [page, ...children.flatMap((child) => getSubtree(structure, child))];
}

/** The checked pages without those whose ancestor is checked too, since moving or archiving the ancestor takes them along. */
export function getTopmostPageIds(structure: PageTreeStructure, pageIds: string[]): string[] {
    const ids = new Set(pageIds);
    return pageIds.filter((id) => structure.pagesById.has(id) && !getAncestorIds(structure, id).some((ancestorId) => ids.has(ancestorId)));
}
