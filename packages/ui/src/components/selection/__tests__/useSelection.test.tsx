import { act, renderHook } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { useSelection } from "../useSelection";

function useTestSelection(ids: string[], initial: string[] = []) {
    const [selectedIds, setSelectedIds] = useState(initial);
    return { selectedIds, selection: useSelection({ ids, selectedIds, onSelectionChange: setSelectedIds }) };
}

describe("useSelection", () => {
    it("toggles single items", () => {
        const { result } = renderHook(() => useTestSelection(["a", "b", "c"]));

        act(() => result.current.selection.toggle("b"));
        expect(result.current.selectedIds).toEqual(["b"]);
        act(() => result.current.selection.toggle("b"));
        expect(result.current.selectedIds).toEqual([]);
    });

    it("selects a range from the previously toggled item", () => {
        const { result } = renderHook(() => useTestSelection(["a", "b", "c", "d"]));

        act(() => result.current.selection.toggle("d"));
        act(() => result.current.selection.toggle("b", { range: true }));
        expect([...result.current.selectedIds].sort()).toEqual(["b", "c", "d"]);
    });

    it("keeps hidden items selected when selecting all visible ones, and reports the visible state", () => {
        const { result } = renderHook(() => useTestSelection(["a", "b"], ["hidden"]));

        expect(result.current.selection.allSelected).toBe(false);
        act(() => result.current.selection.toggle("a"));
        expect(result.current.selection.someSelected).toBe(true);
        act(() => result.current.selection.selectAll());
        expect([...result.current.selectedIds].sort()).toEqual(["a", "b", "hidden"]);
        expect(result.current.selection.allSelected).toBe(true);
        act(() => result.current.selection.clear());
        expect(result.current.selectedIds).toEqual([]);
    });
});
