import isEqual from "lodash.isequal";

import { ContentScope } from "./interfaces/content-scope.interface";

const nonScalarDimension = "__nonScalar__";

/**
 * Membership and deduplication of content scopes. Scanning an array of scopes with `isEqual` grows
 * quadratic — with a few thousand available scopes (e.g. one per dealer) that is seconds of CPU per
 * request, because the available and the allowed scopes are resolved on every request. Scopes are
 * bucketed by a key built from their dimensions and compared with `isEqual` only inside their bucket,
 * which keeps the result identical to a full scan.
 */
export class ContentScopeSet {
    private readonly scopesByKey = new Map<string, ContentScope[]>();

    constructor(scopes: Iterable<ContentScope> = []) {
        for (const scope of scopes) {
            this.add(scope);
        }
    }

    /** Adds the scope and returns whether it was missing before, which makes it a filter predicate for deduplication. */
    add(scope: ContentScope): boolean {
        const key = contentScopeKey(scope);
        const bucket = this.scopesByKey.get(key);

        if (!bucket) {
            this.scopesByKey.set(key, [scope]);
            return true;
        }
        if (bucket.some((candidate) => isEqual(candidate, scope))) {
            return false;
        }
        bucket.push(scope);

        return true;
    }

    has(scope: ContentScope): boolean {
        return this.scopesByKey.get(contentScopeKey(scope))?.some((candidate) => isEqual(candidate, scope)) ?? false;
    }

    values(): ContentScope[] {
        return [...this.scopesByKey.values()].flat();
    }
}

function contentScopeKey(scope: ContentScope): string {
    // A scope can be a class instance (e.g. DamScope) or a plain object (e.g. from a GraphQL input).
    const dimensions: Record<string, unknown> = { ...scope };

    return JSON.stringify(
        Object.keys(dimensions)
            .sort()
            .map((dimension) => {
                const value = dimensions[dimension];
                // Object values share one bucket instead of a key whose order is not stable — isEqual separates them.
                return [dimension, value !== null && typeof value === "object" ? nonScalarDimension : value];
            }),
    );
}
