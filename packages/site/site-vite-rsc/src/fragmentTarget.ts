function decodeFragment(fragment: string) {
    try {
        return decodeURIComponent(fragment);
    } catch {
        // A "%" that isn't part of an escape sequence is valid in an id, e.g. "#100%"
        return fragment;
    }
}

/**
 * The element a URL fragment points to, found like the browser does: by the fragment itself, then by its decoded form
 */
export function getFragmentTarget(fragment: string): HTMLElement | null {
    return document.getElementById(fragment) ?? document.getElementById(decodeFragment(fragment));
}
