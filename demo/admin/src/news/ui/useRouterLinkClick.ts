import { type MouseEvent, useCallback } from "react";
import { useHistory } from "react-router";

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
            history.push(href);
        },
        [history],
    );
}
