import { redirect } from "@dextinity/site-vite-rsc";
import { handleError, renderPage, setPreview, trailingSlashRedirectMiddleware } from "@dextinity/site-vite-rsc/server";
import { type Context, Hono } from "hono";
import { type ReactNode, Suspense } from "react";

import { publicCacheControl } from "../helpers.js";
import { ClientError, ClientNotFound, ClientRouterInfo } from "./clientComponents.js";
import { Layout } from "./Layout.js";
import { Nested, RequestInfo, ServerError, ServerNotFound, ServerRedirect } from "./serverComponents.js";

type TestPageOptions = {
    notFound?: () => ReactNode;
    error?: () => ReactNode;
};

function renderTestPage(c: Context, root: ReactNode, options: TestPageOptions = {}) {
    return renderPage(c, {
        root: <Layout>{root}</Layout>,
        notFound:
            options.notFound ??
            (() => (
                <Layout>
                    <p>Not found page</p>
                </Layout>
            )),
        error:
            options.error ??
            (() => (
                <Layout>
                    <p>Error page</p>
                </Layout>
            )),
        cacheControl: publicCacheControl,
    });
}

export const app = new Hono();

app.use(trailingSlashRedirectMiddleware);

app.use(async (c, next) => {
    if (c.req.query("sitePreview") !== undefined) {
        setPreview({ visibility: "invisiblePages", sitePreview: {} });
    }
    await next();
});

app.get("/", (c) => renderTestPage(c, <p>Home page</p>));

app.get("/request", (c) =>
    renderTestPage(
        c,
        <>
            <RequestInfo />
            <ClientRouterInfo />
        </>,
    ),
);

app.get("/not-found", (c) =>
    renderTestPage(
        c,
        <Nested>
            <p>Content before</p>
            <ServerNotFound />
        </Nested>,
    ),
);

app.get("/not-found-in-suspense", (c) =>
    renderTestPage(
        c,
        <Suspense fallback={<p>Loading</p>}>
            <Nested>
                <ServerNotFound />
            </Nested>
        </Suspense>,
    ),
);

app.get("/not-found-in-client-component", (c) => renderTestPage(c, <ClientNotFound />));

app.get("/not-found-in-not-found-page", (c) => renderTestPage(c, <ServerNotFound />, { notFound: () => <ServerNotFound /> }));

app.get("/redirect", (c) => {
    const status = c.req.query("status");
    return renderTestPage(
        c,
        <Nested>
            <ServerRedirect
                location={c.req.query("location") ?? "/request"}
                status={status ? (Number(status) as 301 | 302 | 307 | 308) : undefined}
            />
        </Nested>,
    );
});

app.get("/redirect-in-handler", () => redirect("/request"));

app.get("/server-error", (c) =>
    renderTestPage(
        c,
        <Nested>
            <ServerError />
        </Nested>,
    ),
);

app.get("/client-error", (c) => renderTestPage(c, <ClientError />));

app.get("/error-in-error-page", (c) => renderTestPage(c, <ServerError />, { error: () => <ServerError /> }));

app.get("/error-in-handler", () => {
    throw new Error("Handler failed");
});

app.onError(handleError);
