import { getMemoizedResponses } from "./requestContext.js";
import { createRequestKey } from "./requestKey.js";
import { isSuccessfulResponse, nullBodyStatuses } from "./successfulResponse.js";

type Fetch = typeof fetch;

export type MemoizedResponse = {
    status: number;
    statusText: string;
    headers: [string, string][];
    body: Uint8Array<ArrayBuffer> | null;
};

function isSafeMethod(request: Request) {
    return request.method === "GET" || request.method === "HEAD";
}

async function fetchMemoizedResponse(baseFetch: Fetch, request: Request, body: Uint8Array<ArrayBuffer>): Promise<MemoizedResponse> {
    // Without the signal of the first caller, as aborting it must not fail the identical requests sharing the response
    const response = await baseFetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: body.byteLength ? body : undefined,
    });
    const hasNullBody = request.method === "HEAD" || nullBodyStatuses.includes(response.status);
    return {
        status: response.status,
        statusText: response.statusText,
        // The body has already been decoded
        headers: [...response.headers.entries()].filter(([name]) => !["content-encoding", "content-length"].includes(name)),
        body: hasNullBody ? null : new Uint8Array(await response.arrayBuffer()),
    };
}

function isReusable({ status, headers, body }: MemoizedResponse) {
    const contentType = headers.find(([name]) => name === "content-type")?.[1] ?? null;
    return isSuccessfulResponse({ status, contentType, body: body ? new TextDecoder().decode(body) : "" });
}

// Failed requests are only shared while in flight, the next identical request tries again
async function forgetUnlessReusable({
    memoizedResponses,
    key,
    promise,
}: {
    memoizedResponses: Map<string, Promise<MemoizedResponse>>;
    key: string;
    promise: Promise<MemoizedResponse>;
}) {
    let isReusableResponse = false;
    try {
        isReusableResponse = isReusable(await promise);
    } catch {
        // The callers handle the error
    }
    if (!isReusableResponse && memoizedResponses.get(key) === promise) {
        memoizedResponses.delete(key);
    }
}

/**
 * Creates a fetch that sends identical requests, i.e. with the same method, URL, headers and body, only once per request of the
 * site, like the request memoization of Next.js. E.g. the layout, the metadata and the page can fetch the same data without
 * sending the same request multiple times. The memoized responses are discarded with the request of the site.
 *
 * Only `GET` and `HEAD` requests are memoized, unless `isMemoizable` allows others, e.g. `POST` requests without side effects.
 * Requests with a `signal` or `keepalive` and outside of a request of the site aren't memoized.
 *
 * Only successful responses are reused, identical requests while a failed one is in flight get the same failure.
 * Use the `cache` function of React to memoize other functions in server components.
 */
export function createRequestMemoizedFetch(
    baseFetch: Fetch,
    { isMemoizable = isSafeMethod }: { isMemoizable?: (request: Request, body: Uint8Array<ArrayBuffer>) => boolean } = {},
): Fetch {
    return async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        const memoizedResponses = getMemoizedResponses();
        // Like Next.js, a signal opts out, as its owner controls the lifetime of the request
        if (!memoizedResponses || init?.signal || init?.keepalive) {
            return baseFetch(input, init);
        }

        const request = new Request(input, init);
        // As bytes, so that binary request bodies are sent unchanged
        const body = new Uint8Array(await request.arrayBuffer());
        if (!isMemoizable(request, body)) {
            return baseFetch(request.url, { method: request.method, headers: request.headers, body: body.byteLength ? body : undefined });
        }

        const key = createRequestKey(request, body);
        let memoizedResponse = memoizedResponses.get(key);
        if (!memoizedResponse) {
            memoizedResponse = fetchMemoizedResponse(baseFetch, request, body);
            memoizedResponses.set(key, memoizedResponse);
            void forgetUnlessReusable({ memoizedResponses, key, promise: memoizedResponse });
        }

        const { status, statusText, headers, body: responseBody } = await memoizedResponse;
        // Every caller gets its own copy, as a body can only be read once
        return new Response(responseBody?.slice() ?? null, { status, statusText, headers });
    };
}
