import isEqual from "lodash.isequal";

import { useContentScope } from "../contentScope/Provider";
import { useCurrentUser } from "../userPermissions/hooks/currentUser";

/**
 * Returns the scopes to query warnings for.
 *
 * The API only accepts scopes of the `warnings` permission, so the scopes are taken from that
 * permission instead of the content scope provider, whose values span all permissions. The current
 * scope comes from the URL, which can contain a dimension combination the user has no `warnings`
 * permission for. Such a scope is not queried, because the API would reject it.
 */
export function useWarningsScopes(showAllScopes: boolean) {
    const { scope } = useContentScope();
    const { permissions } = useCurrentUser();
    const allScopes = permissions.find(({ permission }) => permission === "warnings")?.contentScopes ?? [];

    return showAllScopes ? allScopes : allScopes.filter((item) => isEqual(item, scope));
}
