const lastReloadStorageKey = "dextinity:unknownClientReferenceReload";
const minReloadIntervalInMilliseconds = 10_000;

// Thrown by @vitejs/plugin-rsc in the browser for client component ids its client build doesn't contain
function isUnknownClientReferenceError(error: unknown) {
    return error instanceof Error && error.message.startsWith("client reference not found ");
}

/**
 * During a deployment, a page loaded from the previous build can get an RSC payload of the new build (or the other way
 * round) on a client navigation, which may contain client components the loaded build doesn't know. A full page load
 * renders the page with matching HTML, payload and client build.
 *
 * @returns Whether to reload the page, at most once in a short time to prevent reload loops
 */
export function shouldReloadForUnknownClientReference(error: unknown): boolean {
    if (!isUnknownClientReferenceError(error)) {
        return false;
    }
    try {
        const lastReload = Number(sessionStorage.getItem(lastReloadStorageKey));
        if (Date.now() - lastReload < minReloadIntervalInMilliseconds) {
            return false;
        }
        sessionStorage.setItem(lastReloadStorageKey, String(Date.now()));
        return true;
    } catch {
        // Without storage, a reload loop couldn't be detected
        return false;
    }
}
