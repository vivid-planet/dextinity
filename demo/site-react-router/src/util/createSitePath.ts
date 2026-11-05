import type { GQLPageTreeNodeScope } from "@src/graphql.generated";

type CreateSitePathOptions = {
    path: string;
    scope: Pick<GQLPageTreeNodeScope, "language">;
};

/**
 * Creates a Site path from the provided options.
 *
 * @return {string} The resolved URL: /{scope.language}/path, or /{scope.language} for the path "/", as the site redirects paths with a trailing slash
 */
export const createSitePath = ({ path, scope }: CreateSitePathOptions) => {
    if (!path.startsWith("/")) {
        throw new Error("Path must start with a `/`.");
    }

    return path === "/" ? `/${scope.language}` : `/${scope.language}${path}`;
};
