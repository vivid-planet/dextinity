import { isDeepStrictEqual } from "node:util";

export function contentScopesAreEqual(scope1: object | undefined, scope2: object | undefined): boolean {
    // A scope can be a class instance (e.g. DamScope) or a plain object (e.g. from a GraphQL input).
    // Cloning both into plain objects makes them comparable across those two forms.
    return isDeepStrictEqual({ ...scope1 }, { ...scope2 });
}
