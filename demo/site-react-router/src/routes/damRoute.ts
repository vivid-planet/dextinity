import { proxy } from "hono/proxy";

import type { Route } from "./+types/damRoute";

function proxyToApi({ request }: { request: Request }) {
    const { pathname, search } = new URL(request.url);
    const headers = Object.fromEntries(request.headers);
    delete headers.host;
    return proxy(`${process.env.API_URL_INTERNAL}${pathname}${search}`, {
        method: request.method,
        headers,
        body: request.body,
        // Required by Node.js for streaming request bodies
        ...(request.body ? { duplex: "half" } : {}),
    });
}

export function loader({ request }: Route.LoaderArgs) {
    return proxyToApi({ request });
}

export function action({ request }: Route.ActionArgs) {
    return proxyToApi({ request });
}
