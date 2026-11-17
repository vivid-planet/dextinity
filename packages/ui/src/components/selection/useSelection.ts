import { type KeyboardEvent as ReactKeyboardEvent, useCallback, useEffect, useRef } from "react";

import { matchesShortcut } from "../keyboardShortcut/useKeyboardShortcut";

export interface SelectionOptions {
    /** The ids of the visible items, in their order; ranges and "select all" use them. */
    ids: string[];
    /** The selected ids, also of items hidden by a filter. */
    selectedIds: string[];
    /** Called with the new selection. */
    onSelectionChange: (selectedIds: string[]) => void;
}

export interface SelectionToggleOptions {
    /**
     * Selects every item from the previously toggled one (or else the last selected one) to this one. Defaults to whether Shift is held, so a Shift-click on a
     * checkbox selects a range.
     */
    range?: boolean;
}

export interface Selection {
    /** Whether the item is selected. */
    isSelected: (id: string) => boolean;
    /** Selects or deselects one item, or a range (see `SelectionToggleOptions`). */
    toggle: (id: string, options?: SelectionToggleOptions) => void;
    /** Selects all visible items and keeps the hidden ones that are already selected. */
    selectAll: () => void;
    /** Deselects all items, also hidden ones. */
    clear: () => void;
    /** Whether all visible items are selected, e.g. for a "select all" checkbox. */
    allSelected: boolean;
    /** Whether some, but not all, visible items are selected: the "select all" checkbox is indeterminate. */
    someSelected: boolean;
    /** Put on the list: ⌘A / Ctrl+A selects all visible items, Escape clears the selection. */
    onKeyDown: (event: ReactKeyboardEvent) => void;
}

function isEditable(target: EventTarget) {
    return target instanceof HTMLElement && (target.isContentEditable || target.closest("input:not([type='checkbox']), textarea, select") != null);
}

/**
 * Multiple selection for a list, table or tree: toggle single items, Shift for ranges, ⌘A for all visible items, Escape to clear.
 * The selection stays controlled and survives filtering.
 */
export function useSelection({ ids, selectedIds, onSelectionChange }: SelectionOptions): Selection {
    const anchorRef = useRef<string | null>(null);
    const shiftHeldRef = useRef(false);

    useEffect(() => {
        const updateShift = (event: KeyboardEvent) => {
            shiftHeldRef.current = event.shiftKey;
        };
        const releaseShift = () => {
            shiftHeldRef.current = false;
        };
        document.addEventListener("keydown", updateShift, true);
        document.addEventListener("keyup", updateShift, true);
        window.addEventListener("blur", releaseShift);
        return () => {
            document.removeEventListener("keydown", updateShift, true);
            document.removeEventListener("keyup", updateShift, true);
            window.removeEventListener("blur", releaseShift);
        };
    }, []);

    const selected = new Set(selectedIds);

    const toggle = (id: string, options: SelectionToggleOptions = {}) => {
        const range = options.range ?? shiftHeldRef.current;
        const anchor = anchorRef.current ?? selectedIds.findLast((selectedId) => ids.includes(selectedId)) ?? null;
        const anchorIndex = anchor == null ? -1 : ids.indexOf(anchor);
        const index = ids.indexOf(id);

        if (range && anchorIndex !== -1 && index !== -1) {
            const rangeIds = ids.slice(Math.min(anchorIndex, index), Math.max(anchorIndex, index) + 1);
            onSelectionChange([...selectedIds, ...rangeIds.filter((rangeId) => !selected.has(rangeId))]);
            return;
        }
        anchorRef.current = id;
        onSelectionChange(selected.has(id) ? selectedIds.filter((selectedId) => selectedId !== id) : [...selectedIds, id]);
    };

    const selectAll = () => {
        onSelectionChange([...selectedIds, ...ids.filter((id) => !selected.has(id))]);
    };

    const clear = useCallback(() => {
        anchorRef.current = null;
        onSelectionChange([]);
    }, [onSelectionChange]);

    const onKeyDown = (event: ReactKeyboardEvent) => {
        if (event.defaultPrevented || isEditable(event.target)) {
            return;
        }
        if (matchesShortcut(event, "mod+a")) {
            event.preventDefault();
            selectAll();
        } else if (event.key === "Escape" && selectedIds.length > 0) {
            event.preventDefault();
            clear();
        }
    };

    const visibleSelectedCount = ids.filter((id) => selected.has(id)).length;

    return {
        isSelected: (id) => selected.has(id),
        toggle,
        selectAll,
        clear,
        allSelected: ids.length > 0 && visibleSelectedCount === ids.length,
        someSelected: visibleSelectedCount > 0 && visibleSelectedCount < ids.length,
        onKeyDown,
    };
}
