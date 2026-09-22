import { act, cleanup, renderHook } from "test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useFocusAwarePolling } from "../useFocusAwarePolling";

describe("useFocusAwarePolling", () => {
    const refetch = vi.fn();
    const startPolling = vi.fn();
    const stopPolling = vi.fn();
    const POLL_INTERVAL = 5000;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        vi.spyOn(document, "hasFocus").mockReturnValue(false);
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("should call stopPolling immediately when pollInterval is undefined", () => {
        renderHook(() => useFocusAwarePolling({ pollInterval: undefined, skip: false, refetch, startPolling, stopPolling }));

        expect(stopPolling).toHaveBeenCalledOnce();
        expect(startPolling).not.toHaveBeenCalled();
        expect(refetch).not.toHaveBeenCalled();
    });

    it("should call stopPolling immediately when skip is true", () => {
        renderHook(() => useFocusAwarePolling({ pollInterval: POLL_INTERVAL, skip: true, refetch, startPolling, stopPolling }));

        expect(stopPolling).toHaveBeenCalledOnce();
        expect(startPolling).not.toHaveBeenCalled();
    });

    it("should not start polling when document does not have focus on mount", () => {
        renderHook(() => useFocusAwarePolling({ pollInterval: POLL_INTERVAL, skip: false, refetch, startPolling, stopPolling }));

        act(() => {
            vi.advanceTimersByTime(POLL_INTERVAL * 2);
        });

        expect(startPolling).not.toHaveBeenCalled();
        expect(stopPolling).not.toHaveBeenCalled();
    });

    it("should start polling after pollInterval delay when document has focus on mount", () => {
        vi.spyOn(document, "hasFocus").mockReturnValue(true);

        renderHook(() => useFocusAwarePolling({ pollInterval: POLL_INTERVAL, skip: false, refetch, startPolling, stopPolling }));

        expect(startPolling).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(POLL_INTERVAL);
        });

        expect(startPolling).toHaveBeenCalledOnce();
        expect(startPolling).toHaveBeenCalledWith(POLL_INTERVAL);
    });

    it("should call refetch and startPolling when window gains focus", () => {
        renderHook(() => useFocusAwarePolling({ pollInterval: POLL_INTERVAL, skip: false, refetch, startPolling, stopPolling }));

        act(() => {
            window.dispatchEvent(new Event("focus"));
        });

        expect(refetch).toHaveBeenCalledOnce();
        expect(startPolling).toHaveBeenCalledOnce();
        expect(startPolling).toHaveBeenCalledWith(POLL_INTERVAL);
    });

    it("should call stopPolling when window loses focus", () => {
        renderHook(() => useFocusAwarePolling({ pollInterval: POLL_INTERVAL, skip: false, refetch, startPolling, stopPolling }));

        act(() => {
            window.dispatchEvent(new Event("blur"));
        });

        expect(stopPolling).toHaveBeenCalledOnce();
        expect(refetch).not.toHaveBeenCalled();
    });

    it("should remove focus and blur event listeners on unmount", () => {
        const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

        const { unmount } = renderHook(() => useFocusAwarePolling({ pollInterval: POLL_INTERVAL, skip: false, refetch, startPolling, stopPolling }));

        removeEventListenerSpy.mockClear();
        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith("focus", expect.any(Function));
        expect(removeEventListenerSpy).toHaveBeenCalledWith("blur", expect.any(Function));
    });

    it("should cancel the pending polling timeout on unmount", () => {
        vi.spyOn(document, "hasFocus").mockReturnValue(true);

        const { unmount } = renderHook(() => useFocusAwarePolling({ pollInterval: POLL_INTERVAL, skip: false, refetch, startPolling, stopPolling }));

        unmount();

        act(() => {
            vi.advanceTimersByTime(POLL_INTERVAL);
        });

        expect(startPolling).not.toHaveBeenCalled();
    });

    it("should not respond to focus/blur events after unmount", () => {
        const { unmount } = renderHook(() => useFocusAwarePolling({ pollInterval: POLL_INTERVAL, skip: false, refetch, startPolling, stopPolling }));

        unmount();

        act(() => {
            window.dispatchEvent(new Event("focus"));
            window.dispatchEvent(new Event("blur"));
        });

        expect(startPolling).not.toHaveBeenCalled();
        expect(refetch).not.toHaveBeenCalled();
        expect(stopPolling).not.toHaveBeenCalled();
    });
});
