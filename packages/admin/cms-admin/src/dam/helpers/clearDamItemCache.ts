import type { ApolloCache } from "@apollo/client/cache";

export const clearDamItemCache = (cache: ApolloCache) => {
    cache.evict({ id: "ROOT_QUERY", fieldName: "damItemsList" });
};
