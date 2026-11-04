import { NewsPage } from "@src/news/NewsPage";
import { fetchNewsList } from "@src/news/NewsPage.loader";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { getSiteContext } from "@src/util/siteContext";

import type { Route } from "./+types/NewsIndexPage";

export async function loader({ params, context }: Route.LoaderArgs) {
    const scope = { domain: getSiteContext(context).domain, language: params.language };
    return { scope, initialData: await fetchNewsList({ graphQLFetch: createGraphQLFetch(context), scope, limit: 2 }) };
}

export function ServerComponent({ loaderData: { scope, initialData } }: Route.ServerComponentProps) {
    return <NewsPage scope={scope} initialData={initialData} />;
}
