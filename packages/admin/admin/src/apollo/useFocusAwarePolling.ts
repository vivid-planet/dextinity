import type { ObservableQuery, QueryHookOptions } from "@apollo/client";
import { useEffect } from "react";

type FocusAwarePollingHookOptions = Pick<ObservableQuery, "refetch" | "startPolling" | "stopPolling"> &
    Pick<QueryHookOptions, "pollInterval" | "skip">;

function useFocusAwarePolling({ pollInterval, skip, refetch, startPolling, stopPolling }: FocusAwarePollingHookOptions): void {
    useEffect(() => {
        if (pollInterval === undefined || skip) {
            stopPolling();
            return;
        }

        const handleFocus = () => {
            refetch();

            startPolling(pollInterval);
        };

        const handleBlur = () => {
            stopPolling();
        };

        window.addEventListener("focus", handleFocus);
        window.addEventListener("blur", handleBlur);

        let timeoutId: number | undefined;

        if (document.hasFocus()) {
            // Timeout to prevent duplicate initial requests as useQuery fetches as well
            timeoutId = window.setTimeout(() => {
                startPolling(pollInterval);
            }, pollInterval);
        }

        return () => {
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("blur", handleBlur);

            if (timeoutId !== undefined) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [pollInterval, skip, refetch, startPolling, stopPolling]);
}

export { useFocusAwarePolling };
