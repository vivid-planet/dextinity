import { cacheControlHeaders } from "@dextinity/site-react-router";
import { getPageHeaders } from "@src/util/pageCacheControl";
import { getSiteContext } from "@src/util/siteContext";
import { data } from "react-router";

import type { Route } from "./+types/NewsIndexPage";
import { NewsIndex } from "./NewsIndex";

export const headers = cacheControlHeaders;

export function loader({ params, context }: Route.LoaderArgs) {
    return data({ scope: { domain: getSiteContext(context).domain, language: params.language } }, getPageHeaders(context));
}

export function ServerComponent({ loaderData }: Route.ServerComponentProps) {
    return <NewsIndex scope={loaderData.scope} />;
}
