import { useCurrentRouteMatch } from "@dextinity/admin";

import { getPathnameBelowUrl } from "../common/getPathnameBelowUrl";
import { useContentScope } from "./Provider";

/**
 * The path of the current route below the URL of the content scope, e.g. `/publisher` for the route `/main/en/publisher`.
 */
export function useRoutePathBelowContentScope(): string {
    const { match } = useContentScope();
    const routeUrl = useCurrentRouteMatch()?.url ?? match.url;
    return getPathnameBelowUrl(routeUrl, match.url) ?? routeUrl;
}
