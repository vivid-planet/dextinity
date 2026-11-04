import { act, renderHook } from "test-utils";
import { describe, expect, it, vi } from "vitest";

import { useAsyncOptionsProps } from "../useAsyncOptionsProps";

describe("useAsyncOptionsProps", () => {
    it("should return initial state before any interaction", () => {
        const loadOptions = vi.fn().mockResolvedValue([]);
        const { result } = renderHook(() => useAsyncOptionsProps(loadOptions));

        expect(result.current.isAsync).toBe(true);
        expect(result.current.open).toBe(false);
        expect(result.current.options).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.loadingError).toBeNull();
    });

    it("should load and expose options when onOpen is called", async () => {
        const mockOptions = [
            { id: 1, label: "Option A" },
            { id: 2, label: "Option B" },
        ];
        const loadOptions = vi.fn().mockResolvedValue(mockOptions);
        const { result } = renderHook(() => useAsyncOptionsProps(loadOptions));

        await act(async () => {
            result.current.onOpen({} as never);
        });

        expect(result.current.open).toBe(true);
        expect(result.current.options).toEqual(mockOptions);
        expect(result.current.loading).toBe(false);
        expect(result.current.loadingError).toBeNull();
        expect(loadOptions).toHaveBeenCalledOnce();
    });

    it("should set loading to true while options are being fetched", async () => {
        let resolveOptions!: (options: string[]) => void;
        const pendingPromise = new Promise<string[]>((resolve) => {
            resolveOptions = resolve;
        });
        const loadOptions = vi.fn().mockReturnValue(pendingPromise);
        const { result } = renderHook(() => useAsyncOptionsProps(loadOptions));

        act(() => {
            result.current.onOpen({} as never);
        });

        expect(result.current.loading).toBe(true);
        expect(result.current.open).toBe(true);

        await act(async () => {
            resolveOptions(["opt1"]);
        });

        expect(result.current.loading).toBe(false);
    });

    it("should set loadingError and stop loading when loadOptions rejects", async () => {
        const error = new Error("Network error");
        const loadOptions = vi.fn().mockRejectedValue(error);
        const { result } = renderHook(() => useAsyncOptionsProps(loadOptions));

        await act(async () => {
            result.current.onOpen({} as never);
        });

        expect(result.current.loadingError).toBe(error);
        expect(result.current.loading).toBe(false);
        expect(result.current.options).toEqual([]);
    });

    it("should close the dropdown when onClose is called", async () => {
        const loadOptions = vi.fn().mockResolvedValue(["opt"]);
        const { result } = renderHook(() => useAsyncOptionsProps(loadOptions));

        await act(async () => {
            result.current.onOpen({} as never);
        });

        expect(result.current.open).toBe(true);

        act(() => {
            result.current.onClose({} as never);
        });

        expect(result.current.open).toBe(false);
    });

    it("should clear a previous loadingError when onOpen is called again", async () => {
        const error = new Error("First failure");
        const loadOptions = vi.fn().mockRejectedValueOnce(error).mockResolvedValue(["recovered"]);
        const { result } = renderHook(() => useAsyncOptionsProps(loadOptions));

        await act(async () => {
            result.current.onOpen({} as never);
        });

        expect(result.current.loadingError).toBe(error);

        await act(async () => {
            result.current.onOpen({} as never);
        });

        expect(result.current.loadingError).toBeNull();
        expect(result.current.options).toEqual(["recovered"]);
    });

    it("should handle an empty options list without error", async () => {
        const loadOptions = vi.fn().mockResolvedValue([]);
        const { result } = renderHook(() => useAsyncOptionsProps(loadOptions));

        await act(async () => {
            result.current.onOpen({} as never);
        });

        expect(result.current.options).toEqual([]);
        expect(result.current.loadingError).toBeNull();
    });
});
