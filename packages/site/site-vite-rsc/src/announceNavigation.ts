const visuallyHiddenStyle: Partial<CSSStyleDeclaration> = {
    position: "absolute",
    width: "1px",
    height: "1px",
    margin: "-1px",
    padding: "0",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: "0",
};

let announcer: HTMLElement | undefined;

function getAnnouncer() {
    if (!announcer) {
        announcer = document.createElement("div");
        announcer.setAttribute("aria-live", "assertive");
        announcer.setAttribute("role", "alert");
        Object.assign(announcer.style, visuallyHiddenStyle);
    }
    if (!announcer.isConnected) {
        // React renders the body and may remove children it doesn't know, e.g., when switching to the error page
        document.body.append(announcer);
    }
    return announcer;
}

/**
 * Screen readers announce the page after a full page load, but not after a client navigation
 */
export function setUpNavigationAnnouncer() {
    getAnnouncer();
}

/**
 * Announces the new page to screen readers and moves the focus to the start of the document, like a full page load
 */
export function announceNavigation() {
    getAnnouncer().textContent = document.title || document.querySelector("h1")?.textContent || window.location.pathname;

    document.body.tabIndex = -1;
    document.body.focus({ preventScroll: true });
    document.body.removeAttribute("tabindex");
}
