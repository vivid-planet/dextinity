import { renderDocument } from "@dextinity/site-react-router/server";
import { reportError } from "@src/util/reportError";
import type { EntryContext, HandleErrorFunction } from "react-router";

// Rendering is aborted shortly after, so that the rejected boundaries are still sent
export const streamTimeout = 5000;

export default function handleRequest(request: Request, status: number, headers: Headers, routerContext: EntryContext) {
    return renderDocument({ request, status, headers, routerContext });
}

export const handleError: HandleErrorFunction = (error, { request }) => {
    // Aborted requests, e.g. by the browser, aren't errors of the site
    if (!request.signal.aborted) {
        reportError(error);
    }
};
