import { act, renderHook } from "test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useObservedWidth } from "../useObservedWidth";

describe("useObservedWidth", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.mocked(ResizeObserver).mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    function createElementWithWidth(width: number) {
        const element = document.createElement("div");
        const setWidth = (newWidth: number) => {
            Object.defineProperty(element, "clientWidth", { configurable: true, value: newWidth });
        };
        setWidth(width);
        return { element, setWidth };
    }

    function resize() {
        const [resizeObserverCallback] = vi.mocked(ResizeObserver).mock.calls[0];
        act(() => {
            resizeObserverCallback([], {} as ResizeObserver);
        });
    }

    it("should return the width of the element", () => {
        const { element } = createElementWithWidth(100);

        const { result } = renderHook(() => useObservedWidth({ current: element }));

        expect(result.current).toBe(100);
    });

    it("should update the width once, 500ms after the last resize", () => {
        const { element, setWidth } = createElementWithWidth(100);
        const { result } = renderHook(() => useObservedWidth({ current: element }));

        setWidth(200);
        resize();
        act(() => {
            vi.advanceTimersByTime(200);
        });
        setWidth(300);
        resize();
        act(() => {
            vi.advanceTimersByTime(499);
        });

        expect(result.current).toBe(100);

        act(() => {
            vi.advanceTimersByTime(1);
        });

        expect(result.current).toBe(300);
    });

    it("should stop observing the element on unmount", () => {
        const { element } = createElementWithWidth(100);
        const { unmount } = renderHook(() => useObservedWidth({ current: element }));
        const resizeObserver = vi.mocked(ResizeObserver).mock.results[0].value as ResizeObserver;

        unmount();

        expect(resizeObserver.disconnect).toHaveBeenCalled();
    });
});
