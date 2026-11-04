import { act, renderHook } from "test-utils";
import { describe, expect, it } from "vitest";

import { useBufferedRowCount } from "../useBufferedRowCount";

describe("useBufferedRowCount", () => {
    it("should return 0 when the initial rowCount is undefined", () => {
        const { result } = renderHook(() => useBufferedRowCount(undefined));
        expect(result.current).toBe(0);
    });

    it("should return the rowCount when a defined value is provided", () => {
        const { result } = renderHook(() => useBufferedRowCount(42));
        expect(result.current).toBe(42);
    });

    it("should keep the previous count when rowCount transitions to undefined", () => {
        const { result, rerender } = renderHook(({ count }: { count: number | undefined }) => useBufferedRowCount(count), {
            initialProps: { count: 100 },
        });

        expect(result.current).toBe(100);

        act(() => {
            rerender({ count: undefined });
        });

        expect(result.current).toBe(100);
    });

    it("should update when rowCount changes from one defined value to another", () => {
        const { result, rerender } = renderHook(({ count }: { count: number | undefined }) => useBufferedRowCount(count), {
            initialProps: { count: 10 },
        });

        expect(result.current).toBe(10);

        act(() => {
            rerender({ count: 20 });
        });

        expect(result.current).toBe(20);
    });

    it("should return 0 initially and then update once the first defined value arrives", () => {
        const { result, rerender } = renderHook(({ count }: { count: number | undefined }) => useBufferedRowCount(count), {
            initialProps: { count: undefined },
        });

        expect(result.current).toBe(0);

        act(() => {
            rerender({ count: 5 });
        });

        expect(result.current).toBe(5);
    });

    it("should retain the last known count through multiple undefined transitions", () => {
        const { result, rerender } = renderHook(({ count }: { count: number | undefined }) => useBufferedRowCount(count), {
            initialProps: { count: 50 },
        });

        act(() => rerender({ count: undefined }));
        act(() => rerender({ count: undefined }));

        expect(result.current).toBe(50);
    });
});
