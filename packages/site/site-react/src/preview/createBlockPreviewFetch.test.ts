import { describe, expect, it, vi } from "vitest";

import { createBlockPreviewFetch } from "./createBlockPreviewFetch";

function setup(contentScopeJwt: string | null = null) {
    const originalFetch = vi.fn<typeof fetch>().mockResolvedValue(new Response());
    const blockPreviewFetch = createBlockPreviewFetch(originalFetch, () => contentScopeJwt);

    function getSentHeaders() {
        const init = originalFetch.mock.calls[0][1];
        return new Headers(init?.headers);
    }

    return { originalFetch, blockPreviewFetch, getSentHeaders };
}

const url = `${window.location.origin}/api/data`;

describe("createBlockPreviewFetch", () => {
    it("keeps the headers of a Request input", async () => {
        const { blockPreviewFetch, getSentHeaders } = setup();

        await blockPreviewFetch(new Request(url, { headers: { "x-api-key": "secret" } }));

        expect(getSentHeaders().get("x-api-key")).toBe("secret");
    });

    it("keeps the headers of init", async () => {
        const { blockPreviewFetch, getSentHeaders } = setup();

        await blockPreviewFetch(url, { headers: { "x-api-key": "secret" } });

        expect(getSentHeaders().get("x-api-key")).toBe("secret");
    });

    it("merges the headers of a Request input and init, with init taking precedence", async () => {
        const { blockPreviewFetch, getSentHeaders } = setup();

        await blockPreviewFetch(new Request(url, { headers: { "x-api-key": "secret", "x-shared": "from-request" } }), {
            headers: { "x-other": "value", "x-shared": "from-init" },
        });

        const headers = getSentHeaders();
        expect(headers.get("x-api-key")).toBe("secret");
        expect(headers.get("x-other")).toBe("value");
        expect(headers.get("x-shared")).toBe("from-init");
    });

    it("keeps the headers of a Request input when adding the X-Block-Preview header", async () => {
        const { blockPreviewFetch, getSentHeaders } = setup("jwt");

        await blockPreviewFetch(new Request(url, { headers: { "x-api-key": "secret" } }));

        const headers = getSentHeaders();
        expect(headers.get("x-api-key")).toBe("secret");
        expect(headers.get("X-Block-Preview")).toBe("jwt");
    });

    it("passes the input and the other init options unchanged", async () => {
        const { originalFetch, blockPreviewFetch } = setup();
        const request = new Request(url, { method: "POST", body: "body" });
        const signal = new AbortController().signal;

        await blockPreviewFetch(request, { signal, credentials: "include" });

        const [input, init] = originalFetch.mock.calls[0];
        expect(input).toBe(request);
        expect(init).toMatchObject({ signal, credentials: "include" });
    });
});
