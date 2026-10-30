declare module "virtual:dextinity-site/app" {
    /** The Hono app of the site, see the `app` option of `dextinitySite()` */
    export const app: { fetch(request: Request): Response | Promise<Response> };
}

declare module "virtual:dextinity-site/report-error" {
    /** The error reporter of the site, see the `reportError` option of `dextinitySite()` */
    export function reportError(error: unknown): void;
}
