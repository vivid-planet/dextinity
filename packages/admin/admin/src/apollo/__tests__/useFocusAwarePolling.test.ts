import type { ObservableQuery } from "@apollo/client";
import { act, renderHook } from "test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useFocusAwarePolling } from "../useFocusAwarePolling";

describe("useFocusAwarePolling", () => {
    let refetch: ReturnType<typeof vi.fn<ObservableQuery["refetch"]>>;
    let startPolling: ReturnType<typeof vi.fn<ObservableQuery["startPolling"]>>;
    let stopPolling: ReturnType<typeof vi.fn<ObservableQuery["stopPolling"]>>;

    beforeEach(() => {
        vi.useFakeTimers();
        refetch = vi.fn<ObservableQuery["refetch"]>();
        startPolling = vi.fn<ObservableQuery["startPolling"]>();
        stopPolling = vi.fn<ObservableQuery["stopPolling"]>();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("should call stopPolling immediately when pollInterval is undefined", () => {
        renderHook(() => useFocusAwarePolling({ pollInterval: undefined, refetch, startPolling, stopPolling }));

        expect(stopPolling).toHaveBeenCalledOnce();
        expect(startPolling).not.toHaveBeenCalled();
        expect(refetch).not.toHaveBeenCalled();
    });

    it("should call stopPolling immediately when skip is true", () => {
        renderHook(() => useFocusAwarePolling({ pollInterval: 5000, skip: true, refetch, startPolling, stopPolling }));

        expect(stopPolling).toHaveBeenCalledOnce();
        expect(startPolling).not.toHaveBeenCalled();
    });

    it("should start polling after pollInterval delay when document has focus on mount", () => {
        vi.spyOn(document, "hasFocus").mockReturnValue(true);

        renderHook(() => useFocusAwarePolling({ pollInterval: 5000, refetch, startPolling, stopPolling }));

        expect(startPolling).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(startPolling).toHaveBeenCalledOnce();
        expect(startPolling).toHaveBeenCalledWith(5000);
    });

    it("should not start polling on mount when document does not have focus", () => {
        vi.spyOn(document, "hasFocus").mockReturnValue(false);

        renderHook(() => useFocusAwarePolling({ pollInterval: 5000, refetch, startPolling, stopPolling }));

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(startPolling).not.toHaveBeenCalled();
    });

    it("should refetch and restart polling when window gains focus", () => {
        vi.spyOn(document, "hasFocus").mockReturnValue(false);

        renderHook(() => useFocusAwarePolling({ pollInterval: 5000, refetch, startPolling, stopPolling }));

        act(() => {
            window.dispatchEvent(new Event("focus"));
        });

        expect(refetch).toHaveBeenCalledOnce();
        expect(startPolling).toHaveBeenCalledOnce();
        expect(startPolling).toHaveBeenCalledWith(5000);
    });

    it("should stop polling when window loses focus", () => {
        vi.spyOn(document, "hasFocus").mockReturnValue(false);

        renderHook(() => useFocusAwarePolling({ pollInterval: 5000, refetch, startPolling, stopPolling }));

        stopPolling.mockClear();

        act(() => {
            window.dispatchEvent(new Event("blur"));
        });

        expect(stopPolling).toHaveBeenCalledOnce();
    });

    it("should remove focus and blur event listeners on unmount", () => {
        vi.spyOn(document, "hasFocus").mockReturnValue(false);
        const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

        const { unmount } = renderHook(() => useFocusAwarePolling({ pollInterval: 5000, refetch, startPolling, stopPolling }));

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith("focus", expect.any(Function));
        expect(removeEventListenerSpy).toHaveBeenCalledWith("blur", expect.any(Function));
    });

    it("should not fire focus handler after unmount", () => {
        vi.spyOn(document, "hasFocus").mockReturnValue(false);

        const { unmount } = renderHook(() => useFocusAwarePolling({ pollInterval: 5000, refetch, startPolling, stopPolling }));

        unmount();
        refetch.mockClear();
        startPolling.mockClear();

        act(() => {
            window.dispatchEvent(new Event("focus"));
        });

        expect(refetch).not.toHaveBeenCalled();
        expect(startPolling).not.toHaveBeenCalled();
    });
});
