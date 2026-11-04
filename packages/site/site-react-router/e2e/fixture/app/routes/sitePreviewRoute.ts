import { sitePreviewRoute } from "@dextinity/site-react-router/server";

import type { Route } from "./+types/sitePreviewRoute";

export function loader({ request }: Route.LoaderArgs) {
    return sitePreviewRoute(request);
}
