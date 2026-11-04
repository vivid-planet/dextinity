import { createCachingFetch, createMemoryFetchCacheStore } from "@dextinity/site-react-router/server";

import type { Route } from "./+types/FetchCachePage";

const cachingFetch = createCachingFetch(fetch, { store: createMemoryFetchCacheStore(), revalidateInSeconds: 3600 });

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL("/api/counter", request.url);
    const cached = await (await cachingFetch(url)).json();
    const uncached = await (await cachingFetch(url, { cache: "no-store" })).json();
    return { cachedCount: cached.data.count as number, uncachedCount: uncached.data.count as number };
}

export function ServerComponent({ loaderData }: Route.ServerComponentProps) {
    return (
        <p id="counts">
            Cached {loaderData.cachedCount}, uncached {loaderData.uncachedCount}
        </p>
    );
}
