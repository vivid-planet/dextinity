import { createRSCResponseRenderer, preventCachingOfErrorResponse, runWithRequestContext } from "@dextinity/site-react-router/server";
import {
    createTemporaryReferenceSet,
    decodeAction,
    decodeFormState,
    decodeReply,
    loadServerAction,
    renderToReadableStream,
} from "@vitejs/plugin-rsc/rsc";
import { RouterContextProvider, unstable_matchRSCServerRequest as matchRSCServerRequest } from "react-router";
import basename from "virtual:react-router/unstable_rsc/basename";
import clientVersion from "virtual:react-router/unstable_rsc/client-version";
import routeDiscovery from "virtual:react-router/unstable_rsc/route-discovery";
import routes from "virtual:react-router/unstable_rsc/routes";

import { reportError } from "./reportError";

async function fetchServer(request: Request, requestContext: RouterContextProvider) {
    const renderer = createRSCResponseRenderer({ renderToReadableStream, reportError });
    const response = await runWithRequestContext(requestContext, () =>
        matchRSCServerRequest({
            basename,
            createTemporaryReferenceSet,
            decodeAction,
            decodeFormState,
            decodeReply,
            loadServerAction,
            clientVersion,
            request,
            requestContext,
            routes,
            routeDiscovery,
            onError: renderer.onError,
            generateResponse: renderer.generateResponse,
        }),
    );
    return renderer.completeResponse(request, response);
}

export default {
    async fetch(request: Request): Promise<Response> {
        const ssr = await import.meta.viteRsc.loadModule<typeof import("./entry.ssr")>("ssr", "index");
        const response = await ssr.generateHTML(request, await fetchServer(request, new RouterContextProvider()));
        return preventCachingOfErrorResponse(response);
    },
};

if (import.meta.hot) {
    import.meta.hot.accept();
}
