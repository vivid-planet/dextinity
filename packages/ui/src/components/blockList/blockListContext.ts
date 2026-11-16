import { createContext, type DragEvent, type KeyboardEvent, useContext } from "react";

export interface BlockListItemContextValue {
    index: number;
    count: number;
    reorderable: boolean;
    dropPosition: "before" | "after" | undefined;
    dragging: boolean;
    /** Set when the block's grip should take focus, e.g. after moving the block with the keyboard. */
    focusGrip: boolean;
    onGripKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
    onGripFocused: () => void;
    onDragStart: (event: DragEvent<HTMLElement>) => void;
    onDragEnd: () => void;
    onDragOver: (event: DragEvent<HTMLElement>) => void;
    onDrop: (event: DragEvent<HTMLElement>) => void;
}

export const BlockListItemContext = createContext<BlockListItemContextValue | undefined>(undefined);

export function useBlockListItem() {
    return useContext(BlockListItemContext);
}
