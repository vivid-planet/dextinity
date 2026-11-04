import { previewParams, type SitePreviewParams } from "@dextinity/site-react-router/server";
import { createContext, type MiddlewareFunction } from "react-router";

export const testContext = createContext<{ requestId: string; sitePreview?: SitePreviewParams }>();

export const testContextMiddleware: MiddlewareFunction<Response> = async ({ request, context }, next) => {
    context.set(testContext, { requestId: request.headers.get("x-request-id") ?? "none", sitePreview: (await previewParams(request)) ?? undefined });
    return next();
};
