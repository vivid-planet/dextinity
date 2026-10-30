type ErrorReporter = (error: unknown) => void;

// Set by the entries, so that the server code of this package can also be imported outside of Vite, e.g. in unit tests
let reportErrorOfSite: ErrorReporter = (error) => {
    console.error(error);
};

export function setErrorReporter(reporter: ErrorReporter) {
    reportErrorOfSite = reporter;
}

/**
 * Called for all unexpected errors on the server and in the browser. Passes them to the `reportError` module of the site,
 * see the `reportError` option of `dextinitySite()`
 */
export function reportError(error: unknown) {
    reportErrorOfSite(error);
}
