import { createRequestMemoizedFetch } from "@dextinity/site-vite-rsc/server";

/**
 * The fetch for server code, e.g. block loaders. Identical `GET` requests are sent only once per request, like with the fetch of Next.js.
 */
export const serverFetch = createRequestMemoizedFetch(fetch);
