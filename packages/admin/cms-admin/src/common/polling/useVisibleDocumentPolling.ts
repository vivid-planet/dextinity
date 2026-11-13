import type { ObservableQuery } from "@apollo/client";
import { useEffect } from "react";

interface VisibleDocumentPollingOptions extends Pick<ObservableQuery, "refetch" | "startPolling" | "stopPolling"> {
    /** Milliseconds between polls. `0` doesn't poll. */
    pollInterval: number;
}

/**
 * Polls an Apollo query only while the browser tab is visible, and refetches it when the tab becomes visible again. Unlike
 * `useFocusAwarePolling`, a visible window without focus, e.g. on a second screen, keeps polling.
 */
export function useVisibleDocumentPolling({ pollInterval, refetch, startPolling, stopPolling }: VisibleDocumentPollingOptions): void {
    useEffect(() => {
        if (pollInterval === 0) {
            stopPolling();
            return;
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                void refetch();
                startPolling(pollInterval);
            } else {
                stopPolling();
            }
        };

        if (document.visibilityState === "visible") {
            startPolling(pollInterval);
        }
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            stopPolling();
        };
    }, [pollInterval, refetch, startPolling, stopPolling]);
}
