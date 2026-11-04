import { describe, expect, it } from "vitest";

import { cacheControlHeaders } from "./headers.js";

function callHeaders({ loaderHeaders = {}, parentHeaders = {} }: { loaderHeaders?: HeadersInit; parentHeaders?: HeadersInit }) {
    const headersFunction = cacheControlHeaders as (args: Record<string, Headers | undefined>) => Headers;
    return headersFunction({
        loaderHeaders: new Headers(loaderHeaders),
        parentHeaders: new Headers(parentHeaders),
        actionHeaders: new Headers(),
        errorHeaders: undefined,
    });
}

describe("cacheControlHeaders", () => {
    it("uses the cache control of the loader", () => {
        const headers = callHeaders({
            loaderHeaders: { "Cache-Control": "s-maxage=450" },
            parentHeaders: { "Cache-Control": "no-store", "X-Parent": "1" },
        });

        expect(headers.get("cache-control")).toBe("s-maxage=450");
        expect(headers.get("x-parent")).toBe("1");
    });

    it("keeps the headers of the parent routes without a cache control of the loader", () => {
        expect(callHeaders({ parentHeaders: { "Cache-Control": "no-store" } }).get("cache-control")).toBe("no-store");
    });
});
