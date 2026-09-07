import isEqual from "lodash.isequal";

import type { ContentScope } from "../Provider";

/**
 * Checks whether a (possibly incomplete) scope is contained in another scope.
 *
 * Scopes can have fewer dimensions than the content scope, for instance a DAM file that is scoped by domain only while
 * the content scope consists of domain and language.
 */
export function isScopePartOf(scope: ContentScope, otherScope: ContentScope): boolean {
    return Object.entries(scope).every(([dimension, value]) => isEqual(otherScope[dimension], value));
}
