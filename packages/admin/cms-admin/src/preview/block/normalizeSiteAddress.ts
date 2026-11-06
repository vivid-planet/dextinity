/**
 * Removes the trailing slash of the page's path, as the site's own links don't have one, e.g. `https://example.com/en/` becomes
 * `https://example.com/en`. The slash of the site's root (`https://example.com/`) stays.
 */
export function normalizeSiteAddress(address: string) {
    const pathEnd = address.search(/[?#]/);
    const path = pathEnd === -1 ? address : address.slice(0, pathEnd);
    const queryAndFragment = pathEnd === -1 ? "" : address.slice(pathEnd);
    if (/^[a-z][a-z\d+.-]*:\/\/[^/]+\/$/i.test(path)) {
        return address;
    }
    return path.replace(/(?<=[^/])\/+$/, "") + queryAndFragment;
}
