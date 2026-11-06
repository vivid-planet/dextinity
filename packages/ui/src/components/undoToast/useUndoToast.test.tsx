import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { NewToast } from "../toast/useToasts";
import { useUndoToast } from "./useUndoToast";

describe("useUndoToast", () => {
    it("runs the action right away and undoes it from the toast's action", () => {
        const addToast = vi.fn((_toast: NewToast) => "toast-1");
        const run = vi.fn();
        const undo = vi.fn();
        const { result } = renderHook(() => useUndoToast({ addToast }));

        act(() => {
            result.current.perform({ run, undo, message: "“Benefits” archived", undoneMessage: "“Benefits” restored" });
        });
        expect(run).toHaveBeenCalledTimes(1);
        const toast = addToast.mock.calls[0][0];
        expect(toast.message).toBe("“Benefits” archived");
        expect(toast.action?.label).toBe("Undo");

        act(() => toast.action?.onClick());
        expect(undo).toHaveBeenCalledTimes(1);
        expect(addToast).toHaveBeenLastCalledWith({ message: "“Benefits” restored", icon: undefined });
    });

    it("shows a blocked action as an error toast with the reason", () => {
        const addToast = vi.fn((_toast: NewToast) => "toast-1");
        const { result } = renderHook(() => useUndoToast({ addToast }));

        act(() => {
            result.current.block("“logo.svg” is still in use · nothing deleted");
        });
        expect(addToast).toHaveBeenCalledWith({ message: "“logo.svg” is still in use · nothing deleted", tone: "error" });
    });
});
