import type { GQLPredefinedPageType } from "@src/graphql.generated";
import type { ContentScope } from "@src/site-configs";
import { createSitePath } from "@src/util/createSitePath";

export type PredefinedPage = {
    type: GQLPredefinedPageType;
    path: string;
    scope: ContentScope;
};

function isSameScope(a: ContentScope, b: ContentScope) {
    return a.domain === b.domain && a.language === b.language;
}

function isPathWithin(path: string, basePath: string) {
    return basePath === "/" || path === basePath || path.startsWith(`${basePath}/`);
}

function joinPaths(basePath: string, subPath: string) {
    if (subPath === "") {
        return basePath;
    }

    return basePath === "/" ? subPath : `${basePath}${subPath}`;
}

export function createSitePathForPredefinedPage(predefinedPage: PredefinedPage, path = "") {
    if (path !== "" && !path.startsWith("/")) {
        throw new Error("Path must start with a `/`.");
    }

    return createSitePath({ path: joinPaths(predefinedPage.path, path), scope: predefinedPage.scope });
}

export function matchPredefinedPage(predefinedPages: PredefinedPage[], { path, scope }: { path: string; scope: ContentScope }) {
    const predefinedPage = predefinedPages
        .filter((page) => isSameScope(page.scope, scope) && isPathWithin(path, page.path))
        .sort((a, b) => b.path.length - a.path.length)[0];

    if (!predefinedPage) {
        return undefined;
    }

    const subPath = predefinedPage.path === "/" ? path : path.substring(predefinedPage.path.length);

    return { predefinedPage, path: subPath === "" ? "/" : subPath };
}

/**
 * Creates a Site path to a predefined page, or to a sub path of it, based on where the predefined page is located in the page tree.
 *
 * @return {string | undefined} The resolved URL: /{scope.language}{predefinedPage.path}{path}, or undefined if the scope has no predefined page of this type
 */
export function createPredefinedPageSitePath({
    predefinedPages,
    type,
    scope,
    path = "",
}: {
    predefinedPages: PredefinedPage[];
    type: GQLPredefinedPageType;
    scope: ContentScope;
    path?: string;
}) {
    const predefinedPage = predefinedPages.find((page) => page.type === type && isSameScope(page.scope, scope));

    if (!predefinedPage) {
        return undefined;
    }

    return createSitePathForPredefinedPage(predefinedPage, path);
}
