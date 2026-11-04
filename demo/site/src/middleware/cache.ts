import { createCache } from "cache-manager";

// Next.js' data cache doesn't apply to fetch calls in middleware, so without this cache
// every request would query the API for redirects
export const memoryCache = createCache({
    ttl: 15 * 60 * 1000, // 15 minutes
    refreshThreshold: 5 * 60 * 1000, // refresh if less than 5 minutes TTL are remaining
});

memoryCache.on("refresh", ({ error }) => {
    if (error) {
        console.error("Error refreshing cache in background", error);
    }
});
