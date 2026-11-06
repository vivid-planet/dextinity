import { type MouseEvent, useCallback } from "react";
import { useHistory } from "react-router";

/**
 * Navigates with the router when a link of `@dextinity/ui` is clicked, e.g. the back link of a `PageHeader`. Clicks with a modifier key
 * or another mouse button keep the browser's behavior, e.g. opening the link in a new tab.
 */
export function useRouterLinkClick() {
    const history = useHistory();
    return useCallback(
        (event: MouseEvent<HTMLElement>) => {
            const href = event.currentTarget.getAttribute("href");
            const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
            if (href == null || isModifiedClick) {
                return;
            }
            event.preventDefault();
            history.push(withoutBasename(href, history.createHref({ pathname: "/" })));
        },
        [history],
    );
}

function withoutBasename(href: string, rootHref: string) {
    const basename = rootHref.replace(/\/$/, "");
    return basename !== "" && href.startsWith(basename) ? href.slice(basename.length) : href;
}
