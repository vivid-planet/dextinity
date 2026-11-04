import { useState } from "react";
import { act, renderHook } from "test-utils";
import { describe, expect, it, vi } from "vitest";

import { decomposeUpdateStateAction } from "./decomposeUpdateStateAction";

type State = { foo: number; bar: string };

function useDecomposed<Whitelisted extends keyof State>(initial: State, whitelist: ReadonlyArray<Whitelisted>) {
    const [state, setState] = useState<State>(initial);
    const updateAllowed = decomposeUpdateStateAction(setState, [...whitelist]);
    return { state, updateAllowed };
}

describe("decomposeUpdateStateAction", () => {
    it("updates only whitelisted keys when dispatching an object", () => {
        const { result } = renderHook(() => useDecomposed({ foo: 1, bar: "old" }, ["bar"] as const));

        act(() => {
            result.current.updateAllowed({ bar: "new" });
        });

        expect(result.current.state).toEqual({ foo: 1, bar: "new" });
    });

    it("leaves keys outside the whitelist untouched", () => {
        const { result } = renderHook(() => useDecomposed({ foo: 42, bar: "old" }, ["bar"] as const));

        act(() => {
            result.current.updateAllowed({ bar: "new" });
        });

        expect(result.current.state.foo).toBe(42);
    });

    it("passes only whitelisted keys to a function updater", () => {
        const updater = vi.fn((prev: Pick<State, "bar">) => ({ bar: `${prev.bar}!` }));
        const { result } = renderHook(() => useDecomposed({ foo: 99, bar: "hello" }, ["bar"] as const));

        act(() => {
            result.current.updateAllowed(updater);
        });

        expect(updater).toHaveBeenCalledWith({ bar: "hello" });
        expect(result.current.state).toEqual({ foo: 99, bar: "hello!" });
    });

    it("exposes an empty previous state to a function updater when the whitelist is empty", () => {
        const updater = vi.fn(() => ({}));
        const { result } = renderHook(() => useDecomposed({ foo: 1, bar: "old" }, [] as const));

        act(() => {
            result.current.updateAllowed(updater);
        });

        expect(updater).toHaveBeenCalledWith({});
        expect(result.current.state).toEqual({ foo: 1, bar: "old" });
    });

    it("exposes the full previous state to a function updater when all keys are whitelisted", () => {
        const updater = vi.fn((prev: State) => prev);
        const { result } = renderHook(() => useDecomposed({ foo: 1, bar: "old" }, ["foo", "bar"] as const));

        act(() => {
            result.current.updateAllowed(updater);
        });

        expect(updater).toHaveBeenCalledWith({ foo: 1, bar: "old" });
    });
});
