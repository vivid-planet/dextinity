import { createContext, useContext } from "react";

interface ICreateFetchOptions {
    baseUrl?: string; // pepends a baseUrl to all requests starting with /
    interceptHeaders?: (headers: Headers) => Promise<void>; // allows modifying headers for all requests (can be async)
}

const isUrlAbsolute = (url: string) => url.indexOf("://") > 0 || url.indexOf("//") === 0;

export function createFetch(options: ICreateFetchOptions) {
    async function appFetch(input: RequestInfo, init?: RequestInit) {
        init = init || {};
        init.headers = init.headers ? new Headers(init.headers) : new Headers();
        if (options.interceptHeaders) {
            await options.interceptHeaders(init.headers);
        }

        // make sure we deal with a Request object even if we got a URL string
        if (options.baseUrl && typeof input === "string" && !isUrlAbsolute(input)) {
            input = options.baseUrl + input;
        }
        const req = new Request(input, init);
        return fetch(req, init);
    }
    return appFetch;
}

type fetchType = typeof window.fetch;
export const FetchContext = createContext<fetchType>(window.fetch);
export const FetchProvider = FetchContext.Provider;

export function useFetch() {
    return useContext(FetchContext);
}
