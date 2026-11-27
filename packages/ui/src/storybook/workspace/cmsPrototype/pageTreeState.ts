import { type ContentStatus, flattenPages, type SitePage } from "./cmsData";

export function slugify(name: string) {
    return name
        .toLowerCase()
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function findInTree(pages: SitePage[], id: string): SitePage | undefined {
    for (const page of pages) {
        if (page.id === id) {
            return page;
        }
        const found = findInTree(page.children ?? [], id);
        if (found != null) {
            return found;
        }
    }
    return undefined;
}

export function updatePages(pages: SitePage[], ids: string[], update: (page: SitePage) => SitePage): SitePage[] {
    return pages.map((page) => {
        const children = page.children && updatePages(page.children, ids, update);
        const withChildren = children === page.children ? page : { ...page, children };
        return ids.includes(page.id) ? update(withChildren) : withChildren;
    });
}

export function setStatus(pages: SitePage[], ids: string[], status: ContentStatus) {
    return updatePages(pages, ids, (page) => ({ ...page, status }));
}

/** Removes the pages and, with them, the pages below them. */
export function removePages(pages: SitePage[], ids: string[]): SitePage[] {
    return pages
        .filter((page) => !ids.includes(page.id))
        .map((page) => (page.children ? { ...page, children: removePages(page.children, ids) } : page));
}

export function addChild(pages: SitePage[], parentId: string | null, child: SitePage): SitePage[] {
    if (parentId == null) {
        return [...pages, child];
    }
    return updatePages(pages, [parentId], (page) => ({ ...page, children: [...(page.children ?? []), child] }));
}

/** The ids of the pages and all pages below them. */
export function withDescendantIds(pages: SitePage[], ids: string[]): string[] {
    const result: string[] = [];
    const visit = (page: SitePage, isIncluded: boolean) => {
        const included = isIncluded || ids.includes(page.id);
        if (included) {
            result.push(page.id);
        }
        for (const child of page.children ?? []) {
            visit(child, included);
        }
    };
    for (const page of pages) {
        visit(page, false);
    }
    return result;
}

let copyCounter = 0;

/** A copy of the page with the pages below it, at the path, with the paths below it rebuilt from it. */
function copyTree(page: SitePage, path: string | undefined): SitePage {
    copyCounter += 1;
    const childBasePath = path == null || path === "/" ? "" : path;
    return {
        ...page,
        id: `${page.id}-copy-${copyCounter}`,
        path,
        status: "unpublished",
        icon: undefined,
        children: page.children?.map((child) =>
            copyTree(child, child.type === "link" ? child.path : `${childBasePath}/${child.path?.split("/").pop() ?? "page"}`),
        ),
    };
}

function getUnusedPath(page: SitePage, path: string | undefined, usedPaths: Set<string | undefined>) {
    if (page.type === "link" || path == null) {
        return path;
    }
    let unusedPath = path;
    for (let number = 1; usedPaths.has(unusedPath); number++) {
        unusedPath = number === 1 ? `${path}-copy` : `${path}-copy-${number}`;
    }
    usedPaths.add(unusedPath);
    return unusedPath;
}

/**
 * Puts a copy of each page, with the pages below it, right after the page. A page below another chosen page is copied with that one.
 * Copies start unpublished.
 */
export function duplicatePages(pages: SitePage[], ids: string[]): { pages: SitePage[]; copyIds: string[] } {
    const copyIds: string[] = [];
    const usedPaths = new Set(flattenPages(pages).map((page) => page.path));
    const duplicate = (siblings: SitePage[]): SitePage[] =>
        siblings.flatMap((page) => {
            if (ids.includes(page.id)) {
                const copy = { ...copyTree(page, getUnusedPath(page, page.path, usedPaths)), label: `${page.label} (copy)` };
                copyIds.push(copy.id);
                return [page, copy];
            }
            return [page.children ? { ...page, children: duplicate(page.children) } : page];
        });
    return { pages: duplicate(pages), copyIds };
}

/** The pages above a page, from the root; `undefined` when the page isn't in the tree. */
export function findTrail(pages: SitePage[], id: string): SitePage[] | undefined {
    for (const page of pages) {
        if (page.id === id) {
            return [];
        }
        const trail = findTrail(page.children ?? [], id);
        if (trail != null) {
            return [page, ...trail];
        }
    }
    return undefined;
}

/**
 * Inserts copies of the pages, with the pages below them, as the last children of the target. A page below another copied page comes
 * along with that one. Copies start unpublished; their paths follow the target's.
 */
export function pastePages(pages: SitePage[], ids: string[], targetId: string): { pages: SitePage[]; copyIds: string[] } {
    const target = findInTree(pages, targetId);
    if (target == null) {
        return { pages, copyIds: [] };
    }
    const topLevelIds = ids.filter((id) => !(findTrail(pages, id) ?? []).some((ancestor) => ids.includes(ancestor.id)));
    const targetPath = target.path == null || target.path === "/" ? "" : target.path;
    const usedPaths = new Set(flattenPages(pages).map((page) => page.path));
    const copies = topLevelIds.flatMap((id) => {
        const page = findInTree(pages, id);
        if (page == null) {
            return [];
        }
        const path = page.type === "link" ? page.path : `${targetPath}/${page.path?.split("/").pop() ?? "page"}`;
        return [copyTree(page, getUnusedPath(page, path, usedPaths))];
    });
    return {
        pages: updatePages(pages, [targetId], (page) => ({ ...page, children: [...(page.children ?? []), ...copies] })),
        copyIds: copies.map((copy) => copy.id),
    };
}
