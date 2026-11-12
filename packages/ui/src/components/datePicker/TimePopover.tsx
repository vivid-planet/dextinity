import { Popover as BasePopover } from "@base-ui/react/popover";
import { type KeyboardEvent, type RefObject, useEffect, useRef, useState } from "react";

import { useThemePortalContainer } from "../../utils/themePortalContainer";
import { Icon } from "../icon/Icon";
import { closestTimeIndex, formatTime, type TimeOfDay, timesOfDay, timeStepMinutes } from "./dateValues";
import styles from "./TimePopover.module.scss";
import { usePopupTabOut } from "./usePopupTabOut";

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

const typeAheadTimeout = 750;

/**
 * The button after a time input and the list of times it opens, below the end of the field box. Arrow keys move by one time, Page Up and
 * Page Down by an hour, Home and End to the first and last time, typing jumps to the first time that starts with the typed text, and
 * Enter or Space chooses.
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
    const labels = times.map((time) => formatTime(time, locale));
    const [focusedIndex, setFocusedIndex] = useState(0);
    const moveFocusRef = useRef(false);
    const typeAheadRef = useRef({ text: "", timeout: 0 });
    const tabOut = usePopupTabOut({ trigger: anchor, finalFocus, onClose: () => onOpenChange(false) });

    useEffect(() => () => window.clearTimeout(typeAheadRef.current.timeout), []);

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

    const focusOption = (index: number) => {
        moveFocusRef.current = true;
        setFocusedIndex(Math.min(times.length - 1, Math.max(0, index)));
    };

    const typeAhead = (character: string) => {
        const typed = typeAheadRef.current;
        window.clearTimeout(typed.timeout);
        typed.text += character.toLowerCase();
        typed.timeout = window.setTimeout(() => {
            typed.text = "";
        }, typeAheadTimeout);
        const match = labels.findIndex((label) => {
            const normalized = label.toLowerCase();
            return normalized.startsWith(typed.text) || normalized.replace(/^0+/, "").startsWith(typed.text);
        });
        if (match !== -1) {
            focusOption(match);
        }
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const hour = Math.max(1, Math.round(60 / timeStepMinutes(step)));
        const moves: Record<string, () => number> = {
            ArrowDown: () => focusedIndex + 1,
            ArrowUp: () => focusedIndex - 1,
            PageDown: () => focusedIndex + hour,
            PageUp: () => focusedIndex - hour,
            Home: () => 0,
            End: () => times.length - 1,
        };
        const move = moves[event.key];
        const focusedTime = times[focusedIndex] as TimeOfDay | undefined;
        if (move) {
            event.preventDefault();
            focusOption(move());
        } else if ((event.key === "Enter" || (event.key === " " && typeAheadRef.current.text === "")) && focusedTime != null) {
            event.preventDefault();
            onSelect(focusedTime);
        } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            typeAhead(event.key);
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
                        aria-labelledby={labelledBy}
                        onKeyDown={tabOut.onKeyDown}
                        initialFocus={() => {
                            const option = listRef.current?.querySelector<HTMLElement>("[data-focus-target]");
                            option?.scrollIntoView({ block: "center" });
                            return option ?? true;
                        }}
                        finalFocus={tabOut.finalFocus}
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
                                        data-highlighted={index === focusedIndex ? "" : undefined}
                                        data-selected={selected ? "" : undefined}
                                        onClick={() => onSelect(time)}
                                        onFocus={() => setFocusedIndex(index)}
                                        onMouseMove={() => index !== focusedIndex && focusOption(index)}
                                    >
                                        <span className={styles.optionText}>{labels[index]}</span>
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
