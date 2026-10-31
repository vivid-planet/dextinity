import { redirect } from "@dextinity/site-vite-rsc";
import { handleError, renderPage, setPreview, trailingSlashRedirectMiddleware } from "@dextinity/site-vite-rsc/server";
import { type Context, Hono } from "hono";
import { type ReactNode, Suspense } from "react";

import { publicCacheControl } from "../helpers.js";
import { BlockPreview } from "./blockPreview.js";
import { ClientError, ClientNotFound, ClientRouterInfo } from "./clientComponents.js";
import { Layout } from "./Layout.js";
import { Nested, RequestInfo, ServerError, ServerNotFound, ServerRedirect } from "./serverComponents.js";
import { TestPage } from "./TestPage.js";

type TestPageOptions = {
    title?: string;
    notFound?: () => ReactNode;
    error?: () => ReactNode;
};

function renderTestPage(c: Context, root: ReactNode, options: TestPageOptions = {}) {
    return renderPage(c, {
        root: <Layout title={options.title}>{root}</Layout>,
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

app.get("/block-preview/:type", (c) => renderTestPage(c, <BlockPreview type={c.req.param("type")} />));

app.get("/favicon.ico", (c) => c.body(null, 204)); // Browsers request it, a 404 would be an error in the browser tests

app.get("/pages/:name", async (c) => {
    await new Promise((resolve) => setTimeout(resolve, Number(c.req.query("delay") ?? 0)));
    const name = c.req.param("name");
    const imageDelay = c.req.query("imageDelay");
    return renderTestPage(c, <TestPage name={name} imageDelay={imageDelay ? Number(imageDelay) : undefined} />, { title: name });
});

app.get("/tall-image", async (c) => {
    await new Promise((resolve) => setTimeout(resolve, Number(c.req.query("delay") ?? 0)));
    c.header("Content-Type", "image/svg+xml");
    c.header("Cache-Control", "no-store");
    return c.body('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="3000"></svg>');
});

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

app.get("/not-found-in-client-component-in-suspense", (c) =>
    renderTestPage(
        c,
        <Suspense fallback={<p>Loading</p>}>
            <ClientNotFound />
        </Suspense>,
    ),
);

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

app.get("/raw-redirect", (c) => c.redirect(c.req.query("location") ?? "/request"));

app.get("/redirect-loop", (c) => c.redirect("/redirect-loop"));

app.get("/redirect-with-cookie", (c) => {
    c.header("Set-Cookie", "redirected=1; Path=/");
    c.header("Cache-Control", publicCacheControl);
    return c.redirect("/request");
});

app.get("/server-error", (c) =>
    renderTestPage(
        c,
        <Nested>
            <ServerError id={c.req.query("id")} />
        </Nested>,
    ),
);

app.get("/client-error", (c) => renderTestPage(c, <ClientError id={c.req.query("id")} />));

app.get("/client-error-in-suspense", (c) =>
    renderTestPage(
        c,
        <Suspense fallback={<p>Loading</p>}>
            <ClientError />
        </Suspense>,
    ),
);

app.get("/error-in-error-page", (c) => renderTestPage(c, <ServerError />, { error: () => <ServerError /> }));

app.get("/error-in-handler", (c) => {
    throw new Error(`Handler failed${c.req.query("id") ?? ""}`);
});

app.get("/reported-errors", (c) => c.json(globalThis.reportedErrors ?? []));

app.onError(handleError);
