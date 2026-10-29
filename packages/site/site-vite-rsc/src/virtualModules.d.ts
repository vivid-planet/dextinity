declare module "virtual:dextinity-site/app" {
    /** The Hono app of the site, see the `app` option of `dextinitySite()` */
    export const app: { fetch(request: Request): Response | Promise<Response> };
}
