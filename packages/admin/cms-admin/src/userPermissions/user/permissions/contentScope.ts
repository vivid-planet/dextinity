export type ContentScope = {
    [key: string]: string;
};

/**
 * Wildcard value a content scope dimension can have when `getContentScopesForUser` grants access to any value for it.
 * Must match the wildcard value used by `getContentScopesForUser` in `@dextinity/cms-api`.
 */
export const contentScopeAllValues = "*";
