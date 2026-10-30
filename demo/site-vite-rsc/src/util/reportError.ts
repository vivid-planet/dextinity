/**
 * Called for all unexpected errors on the server and in the browser, see the `reportError` option of `dextinitySite()`
 */
export function reportError(error: unknown) {
    // Report the error to the error tracking service (e.g. Sentry) here
    console.error(error);
}
