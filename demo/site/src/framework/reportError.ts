/**
 * Called for all unexpected errors on the server and in the browser. Report them to an error tracking service here.
 */
export function reportError(error: unknown) {
    console.error(error);
}
