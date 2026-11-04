// Logged with a prefix, so that the tests can find the reported errors in the browser console
export function reportError(error: unknown) {
    console.error("Reported error:", error);
}
