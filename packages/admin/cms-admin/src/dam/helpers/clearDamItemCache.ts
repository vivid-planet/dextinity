import type { ApolloCache } from "@apollo/client/cache";

export const clearDamItemCache = (cache: ApolloCache<unknown>) => {
    cache.evict({ id: "ROOT_QUERY", fieldName: "damItemsList" });
};
