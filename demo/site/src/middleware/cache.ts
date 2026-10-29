import { createCache, memoryStore } from "cache-manager";

export const memoryCache = createCache(
    memoryStore({
        // 7.5 minutes: the GraphQL fetch inside the cached function adds up to 7.5 minutes of data cache (see graphQLClientMiddleware.ts),
        // so a change is live after at most 15 minutes
        ttl: 7.5 * 60 * 1000,
    }),
    {
        refreshThreshold: 5 * 60 * 1000, // refresh if less than 5 minutes TTL are remaining,
        onBackgroundRefreshError: (error) => {
            console.error("Error refreshing cache in background", error);
        },
    },
);
