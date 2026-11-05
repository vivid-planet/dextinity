/**
 * Reports the errors of the server and the browser, e.g. to an error tracking service like Sentry
 */
export function reportError(error: unknown) {
    console.error(error);
}
