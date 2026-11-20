import { type KeyboardEvent, useEffect, useState } from "react";

interface Options<Item> {
    items: Item[];
    onSelect: (item: Item) => void;
    onEscape: () => void;
}

export function useListKeyboardNavigation<Item>({ items, onSelect, onEscape }: Options<Item>) {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        setActiveIndex(0);
    }, [items.length]);

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => (items.length === 0 ? 0 : (index + 1) % items.length));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => (items.length === 0 ? 0 : (index - 1 + items.length) % items.length));
        } else if (event.key === "Enter") {
            const item = items[activeIndex];
            if (item !== undefined) {
                event.preventDefault();
                onSelect(item);
            }
        } else if (event.key === "Escape") {
            event.preventDefault();
            onEscape();
        }
    };

    return { activeIndex, setActiveIndex, handleKeyDown };
}

export function scrollActiveOptionIntoView(listElement: HTMLElement | null) {
    listElement?.querySelector("[aria-selected='true']")?.scrollIntoView({ block: "nearest" });
}
