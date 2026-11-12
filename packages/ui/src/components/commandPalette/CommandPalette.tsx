import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { useThemePortalContainer } from "../../utils/themePortalContainer";
import { Icon } from "../icon/Icon";
import { KeyboardShortcut } from "../keyboardShortcut/KeyboardShortcut";
import styles from "./CommandPalette.module.scss";

/**
 * One entry of the command palette: a page to jump to, something to create, or a command.
 */
export interface CommandPaletteItem {
    /** Stable id. */
    id: string;
    /** The text; matches of the query are highlighted. */
    label: string;
    /** Called when the entry is chosen with Enter or a click; the palette then closes. */
    onSelect: () => void;
    icon?: ReactNode;
    /** Shown at the end, so people learn it, e.g. `⌘N`. */
    shortcut?: string;
    /** Further terms the filter finds the entry by. */
    keywords?: string[];
}

/**
 * A section of results, e.g. Jump to, Create, Commands, or Recent.
 */
export interface CommandPaletteGroup {
    label: string;
    items: CommandPaletteItem[];
}

export interface CommandPaletteLabels {
    /** Accessible name of the dialog. */
    title: string;
    /** Placeholder and accessible name of the search field. */
    placeholder: string;
    /** Shown when nothing matches. */
    empty: string;
    /** Footer hint for the arrow keys. */
    navigate: string;
    /** Footer hint for Enter. */
    select: string;
    /** Footer hint for Escape. */
    close: string;
    /** The Escape key's name in the footer. */
    escapeKey: string;
}

const defaultLabels: CommandPaletteLabels = {
    title: "Command palette",
    placeholder: "Search, jump, create …",
    empty: "No results",
    navigate: "Navigate",
    select: "Open",
    close: "Close",
    escapeKey: "Esc",
};

const keyGlyphs = { up: "↑", down: "↓", enter: "↵" };

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type CommandPaletteOwnerState = {
    filter: boolean;
};

export interface CommandPaletteSlotProps {
    /** Props for the `backdrop` slot. */
    backdrop?: SlotPropsValue<CommandPaletteOwnerState, typeof BaseDialog.Backdrop>;
    /** Props for the `footer` slot with the keyboard hints. */
    footer?: SlotPropsValue<CommandPaletteOwnerState, "div">;
}

export interface CommandPaletteProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** Whether the palette is open. */
    open: boolean;
    /** Called when the palette opens or closes: ⌘K or Ctrl+K, Escape, a click outside, or a chosen entry. */
    onOpenChange: (open: boolean) => void;
    /** The text in the search field. */
    query: string;
    /** Called with the new text when the search field changes. */
    onQueryChange: (query: string) => void;
    /** The groups of entries. Empty groups are left out. */
    groups: CommandPaletteGroup[];
    /**
     * Filters the entries by the query, across label and keywords. Set it to `false` when the app already passes matching entries,
     * e.g. from a content search.
     *
     * @defaultValue `true`
     */
    filter?: boolean;
    /** Leaves out the global ⌘K / Ctrl+K shortcut, e.g. when the app handles it itself. */
    disableGlobalShortcut?: boolean;
    /** The built-in texts. */
    labels?: Partial<CommandPaletteLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: CommandPaletteSlotProps;
}

function termsOf(query: string) {
    return query.toLowerCase().split(/\s+/).filter(Boolean);
}

function matches(item: CommandPaletteItem, terms: string[]) {
    const text = [item.label, ...(item.keywords ?? [])].join(" ").toLowerCase();
    return terms.every((term) => text.includes(term));
}

function HighlightedLabel({ label, terms }: { label: string; terms: string[] }) {
    const lower = label.toLowerCase();
    const marked = new Array<boolean>(label.length).fill(false);
    for (const term of terms) {
        const start = lower.indexOf(term);
        if (start >= 0) {
            marked.fill(true, start, start + term.length);
        }
    }
    const parts: { text: string; mark: boolean; start: number }[] = [];
    for (let index = 0; index < label.length; index++) {
        const last = parts.at(-1);
        if (last != null && last.mark === marked[index]) {
            last.text += label[index];
        } else {
            parts.push({ text: label[index], mark: marked[index], start: index });
        }
    }
    return parts.map((part) =>
        part.mark ? (
            <mark key={part.start} className={styles.match}>
                {part.text}
            </mark>
        ) : (
            part.text
        ),
    );
}

/**
 * The command palette (⌘K): search, jump to a page, create something, or run a command, by keyboard. Every feature of the app should
 * be reachable here.
 */
export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(function CommandPalette(
    {
        open,
        onOpenChange,
        query,
        onQueryChange,
        groups,
        filter = true,
        disableGlobalShortcut = false,
        labels: labelsProp,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const ownerState: CommandPaletteOwnerState = { filter };
    const { anchorRef, container } = useThemePortalContainer<HTMLSpanElement>();
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const id = useId();
    const [activeId, setActiveId] = useState<string | null>(null);

    const terms = termsOf(query);
    const visibleGroups = groups
        .map((group) => ({ ...group, items: ownerState.filter ? group.items.filter((item) => matches(item, terms)) : group.items }))
        .filter((group) => group.items.length > 0);
    const visibleItems = visibleGroups.flatMap((group) => group.items);
    const activeItem = visibleItems.find((item) => item.id === activeId) ?? visibleItems.at(0);
    const optionId = (item: CommandPaletteItem) => `${id}-option-${item.id}`;

    useEffect(() => {
        if (disableGlobalShortcut) {
            return;
        }
        function handleKeyDown(event: globalThis.KeyboardEvent) {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                onOpenChange(!open);
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [disableGlobalShortcut, onOpenChange, open]);

    useEffect(() => {
        if (activeItem != null) {
            listRef.current?.querySelector(`[data-id="${CSS.escape(activeItem.id)}"]`)?.scrollIntoView({ block: "nearest" });
        }
    }, [activeItem]);

    function select(item: CommandPaletteItem) {
        item.onSelect();
        onOpenChange(false);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        const index = activeItem == null ? -1 : visibleItems.indexOf(activeItem);
        const moves: Record<string, number | undefined> = {
            ArrowDown: Math.min(index + 1, visibleItems.length - 1),
            ArrowUp: Math.max(index - 1, 0),
            Home: event.ctrlKey ? 0 : undefined,
            End: event.ctrlKey ? visibleItems.length - 1 : undefined,
        };
        const nextIndex = moves[event.key];
        if (nextIndex != null && visibleItems.length > 0) {
            event.preventDefault();
            setActiveId(visibleItems[nextIndex].id);
        } else if (event.key === "Enter" && activeItem != null) {
            event.preventDefault();
            select(activeItem);
        }
    }

    const backdropProps = resolveSlotProps<CommandPaletteOwnerState, typeof BaseDialog.Backdrop, typeof BaseDialog.Backdrop>({
        ownProps: { className: styles.backdrop },
        slotProps: slotProps?.backdrop,
        ownerState,
    });
    const footerProps = resolveSlotProps<CommandPaletteOwnerState, "div", "div">({
        ownProps: { className: styles.footer, "aria-hidden": true },
        slotProps: slotProps?.footer,
        ownerState,
    });

    return (
        <>
            <span ref={anchorRef} hidden />
            <BaseDialog.Root open={open} onOpenChange={(nextOpen) => onOpenChange(nextOpen)}>
                <BaseDialog.Portal container={container}>
                    <BaseDialog.Backdrop {...backdropProps} />
                    <BaseDialog.Popup
                        aria-label={labels.title}
                        {...restProps}
                        ref={ref}
                        initialFocus={inputRef}
                        data-filter={ownerState.filter ? "" : undefined}
                        className={clsx(styles.root, className)}
                    >
                        <div className={styles.searchRow}>
                            <Icon name="search" className={styles.searchIcon} />
                            <input
                                ref={inputRef}
                                type="text"
                                role="combobox"
                                aria-label={labels.placeholder}
                                aria-expanded
                                aria-controls={`${id}-list`}
                                aria-autocomplete="list"
                                aria-activedescendant={activeItem == null ? undefined : optionId(activeItem)}
                                placeholder={labels.placeholder}
                                autoComplete="off"
                                spellCheck={false}
                                value={query}
                                onChange={(event) => {
                                    onQueryChange(event.target.value);
                                    setActiveId(null);
                                }}
                                onKeyDown={handleKeyDown}
                                className={styles.input}
                            />
                        </div>
                        <div ref={listRef} id={`${id}-list`} role="listbox" aria-label={labels.title} className={styles.list}>
                            {visibleItems.length === 0 ? (
                                <p className={styles.empty}>{labels.empty}</p>
                            ) : (
                                visibleGroups.map((group, groupIndex) => (
                                    <div key={group.label} role="group" aria-labelledby={`${id}-group-${groupIndex}`} className={styles.group}>
                                        <span id={`${id}-group-${groupIndex}`} className={styles.groupLabel}>
                                            {group.label}
                                        </span>
                                        {group.items.map((item) => (
                                            <div
                                                key={item.id}
                                                id={optionId(item)}
                                                role="option"
                                                aria-selected={item === activeItem}
                                                data-id={item.id}
                                                className={styles.item}
                                                onPointerMove={() => setActiveId(item.id)}
                                                onClick={() => select(item)}
                                            >
                                                {item.icon != null && <span className={styles.itemIcon}>{item.icon}</span>}
                                                <span className={styles.itemLabel}>
                                                    <HighlightedLabel label={item.label} terms={terms} />
                                                </span>
                                                {item.shortcut != null && (
                                                    <KeyboardShortcut className={styles.itemShortcut}>{item.shortcut}</KeyboardShortcut>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>
                        <div {...footerProps}>
                            <span className={styles.hint}>
                                <KeyboardShortcut>{keyGlyphs.up}</KeyboardShortcut>
                                <KeyboardShortcut>{keyGlyphs.down}</KeyboardShortcut>
                                {labels.navigate}
                            </span>
                            <span className={styles.hint}>
                                <KeyboardShortcut>{keyGlyphs.enter}</KeyboardShortcut>
                                {labels.select}
                            </span>
                            <span className={styles.hint}>
                                <KeyboardShortcut>{labels.escapeKey}</KeyboardShortcut>
                                {labels.close}
                            </span>
                        </div>
                    </BaseDialog.Popup>
                </BaseDialog.Portal>
            </BaseDialog.Root>
        </>
    );
});
