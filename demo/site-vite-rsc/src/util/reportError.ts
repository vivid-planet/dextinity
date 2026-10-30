/**
 * Called for all unexpected errors on the server and in the browser, see the `reportError` option of `dextinitySite()`
 */
export function reportError(error: unknown) {
    // Report the error to the error tracking service (e.g. Sentry) here. This module runs on the server (RSC and SSR) and in the
    // browser, import the SDKs dynamically, so that the browser doesn't load the server SDK:
    // if (import.meta.env.SSR) {
    //     void import("@sentry/node").then((Sentry) => Sentry.captureException(error));
    // } else {
    //     void import("@sentry/browser").then((Sentry) => Sentry.captureException(error));
    // }
    console.error(error);
}
