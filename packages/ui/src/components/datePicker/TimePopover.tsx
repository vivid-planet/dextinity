import { Popover as BasePopover } from "@base-ui/react/popover";
import { type KeyboardEvent, type RefObject, useEffect, useRef, useState } from "react";

import { useThemePortalContainer } from "../../utils/themePortalContainer";
import { Icon } from "../icon/Icon";
import { closestTimeIndex, formatTime, type TimeOfDay, timesOfDay } from "./dateValues";
import styles from "./TimePopover.module.scss";

interface TimePopoverProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** The chosen time, marked in the list; without one, the list starts at the time closest to now. */
    value: TimeOfDay | null;
    onSelect: (time: TimeOfDay) => void;
    /** Minutes between two times in the list. */
    step: number;
    locale: string | undefined;
    /** Accessible name of the button that opens the list. */
    triggerLabel: string;
    triggerClassName: string;
    disabled: boolean;
    /** The element focused when the list closes, usually the time input. */
    finalFocus: RefObject<HTMLElement | null>;
    /** The ids of the labels that name the list. */
    labelledBy: string;
}

function isSameTime(first: TimeOfDay | null, second: TimeOfDay) {
    return first != null && first.hours === second.hours && first.minutes === second.minutes;
}

/**
 * The button after a time input and the list of times it opens, below the end of the field box. Arrow keys move by one time, Page Up and
 * Page Down by an hour, Home and End to the first and last time, and Enter or Space chooses.
 */
export function TimePopover({
    open,
    onOpenChange,
    value,
    onSelect,
    step,
    locale,
    triggerLabel,
    triggerClassName,
    disabled,
    finalFocus,
    labelledBy,
}: TimePopoverProps) {
    const { anchor, anchorRef, container } = useThemePortalContainer<HTMLButtonElement>();
    const fieldBox = anchor?.parentElement ?? null;
    const listRef = useRef<HTMLDivElement>(null);
    const times = timesOfDay(step);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const moveFocusRef = useRef(false);

    useEffect(() => {
        if (moveFocusRef.current) {
            moveFocusRef.current = false;
            const option = listRef.current?.querySelector<HTMLElement>("[data-focus-target]");
            option?.focus({ preventScroll: true });
            option?.scrollIntoView({ block: "nearest" });
        }
    }, [focusedIndex]);

    const openChange = (nextOpen: boolean) => {
        if (nextOpen) {
            const now = new Date();
            setFocusedIndex(closestTimeIndex(times, value ?? { hours: now.getHours(), minutes: now.getMinutes() }));
        }
        onOpenChange(nextOpen);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const hour = Math.max(1, Math.round(60 / step));
        const moves: Record<string, () => number> = {
            ArrowDown: () => focusedIndex + 1,
            ArrowUp: () => focusedIndex - 1,
            PageDown: () => focusedIndex + hour,
            PageUp: () => focusedIndex - hour,
            Home: () => 0,
            End: () => times.length - 1,
        };
        const move = moves[event.key];
        if (move) {
            event.preventDefault();
            moveFocusRef.current = true;
            setFocusedIndex(Math.min(times.length - 1, Math.max(0, move())));
        } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(times[focusedIndex]);
        }
    };

    return (
        <BasePopover.Root open={open} onOpenChange={(nextOpen) => openChange(nextOpen)}>
            <BasePopover.Trigger ref={anchorRef} type="button" className={triggerClassName} aria-label={triggerLabel} disabled={disabled}>
                <Icon name="time" />
            </BasePopover.Trigger>
            <BasePopover.Portal container={container}>
                <BasePopover.Positioner className={styles.positioner} anchor={fieldBox} side="bottom" align="end" sideOffset={6} collisionPadding={8}>
                    <BasePopover.Popup
                        className={styles.popup}
                        initialFocus={() => {
                            const option = listRef.current?.querySelector<HTMLElement>("[data-focus-target]");
                            option?.scrollIntoView({ block: "center" });
                            return option ?? true;
                        }}
                        finalFocus={finalFocus}
                    >
                        <div ref={listRef} role="listbox" aria-labelledby={labelledBy} className={styles.list} onKeyDown={onKeyDown}>
                            {times.map((time, index) => {
                                const selected = isSameTime(value, time);
                                return (
                                    <div
                                        key={index}
                                        role="option"
                                        aria-selected={selected}
                                        tabIndex={index === focusedIndex ? 0 : -1}
                                        className={styles.option}
                                        data-focus-target={index === focusedIndex ? "" : undefined}
                                        data-selected={selected ? "" : undefined}
                                        onClick={() => onSelect(time)}
                                        onFocus={() => setFocusedIndex(index)}
                                    >
                                        {formatTime(time, locale)}
                                        {selected && <Icon name="check" className={styles.indicator} />}
                                    </div>
                                );
                            })}
                        </div>
                    </BasePopover.Popup>
                </BasePopover.Positioner>
            </BasePopover.Portal>
        </BasePopover.Root>
    );
}
