/**
 * The tests read the reported errors from the output of the server and the console of the browser
 */
export function reportError(error: unknown) {
    console.error("Reported error:", error instanceof Error ? error.message : error);
}
