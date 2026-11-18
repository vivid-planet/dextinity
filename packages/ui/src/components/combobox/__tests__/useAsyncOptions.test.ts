import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useAsyncOptions } from "../useAsyncOptions";

describe("useAsyncOptions", () => {
    it("doesn't load while disabled", () => {
        const loadOptions = vi.fn(async () => ["News"]);
        renderHook(() => useAsyncOptions({ loadOptions, query: "", enabled: false, debounce: 0 }));

        expect(loadOptions).not.toHaveBeenCalled();
    });

    it("reports an error and loads again on retry", async () => {
        const loadOptions = vi.fn().mockRejectedValueOnce(new Error("Network error")).mockResolvedValue(["News"]);
        const { result } = renderHook(() => useAsyncOptions({ loadOptions, query: "", enabled: true, debounce: 0 }));

        await waitFor(() => expect(result.current.status).toBe("error"));
        act(() => result.current.retry());

        await waitFor(() => expect(result.current).toMatchObject({ status: "success", options: ["News"] }));
        expect(loadOptions).toHaveBeenCalledTimes(2);
    });

    it("waits for the debounce after typing and aborts the older request", async () => {
        vi.useFakeTimers();
        const signals: AbortSignal[] = [];
        const loadOptions = vi.fn((_query: string, { signal }: { signal: AbortSignal }) => {
            signals.push(signal);
            return new Promise<string[]>(() => {});
        });
        const { result, rerender } = renderHook(({ query }) => useAsyncOptions({ loadOptions, query, enabled: true, debounce: 300 }), {
            initialProps: { query: "" },
        });
        expect(loadOptions).toHaveBeenCalledWith("", expect.anything());

        rerender({ query: "ne" });
        expect(result.current.status).toBe("loading");
        await act(async () => vi.advanceTimersByTime(299));
        expect(loadOptions).toHaveBeenCalledTimes(1);
        await act(async () => vi.advanceTimersByTime(1));

        expect(loadOptions).toHaveBeenLastCalledWith("ne", expect.anything());
        expect(signals[0].aborted).toBe(true);
        vi.useRealTimers();
    });
});
