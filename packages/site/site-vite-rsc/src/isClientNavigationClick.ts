/**
 * Clicks the browser handles itself, e.g., opening a new tab or downloading a file, aren't client navigations
 */
export function isClientNavigationClick(event: MouseEvent, link: HTMLAnchorElement) {
    if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey ||
        event.defaultPrevented ||
        (link.target && link.target !== "_self") ||
        link.hasAttribute("download") ||
        link.origin !== window.location.origin
    ) {
        return false;
    }

    const isHashChangeOnCurrentPage = link.hash !== "" && link.pathname === window.location.pathname && link.search === window.location.search;
    return !isHashChangeOnCurrentPage; // The browser scrolls to the anchor without a request
}
