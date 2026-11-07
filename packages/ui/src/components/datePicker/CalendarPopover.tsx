import { Popover as BasePopover } from "@base-ui/react/popover";
import { type RefObject, useRef } from "react";

import { useThemePortalContainer } from "../../utils/themePortalContainer";
import { Icon } from "../icon/Icon";
import { Calendar, type CalendarProps } from "./Calendar";
import styles from "./Calendar.module.scss";

interface CalendarPopoverProps extends CalendarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Accessible name of the button that opens the calendar. */
    triggerLabel: string;
    triggerClassName: string;
    disabled: boolean;
    /** The element focused when the calendar closes, usually the text input. */
    finalFocus: RefObject<HTMLElement | null>;
    /** The id of the field's label, which names the popup. */
    labelledBy: string;
}

/**
 * The button at the end of a date field and the calendar it opens, placed below the whole field box.
 */
export function CalendarPopover({
    open,
    onOpenChange,
    triggerLabel,
    triggerClassName,
    disabled,
    finalFocus,
    labelledBy,
    ...calendarProps
}: CalendarPopoverProps) {
    const { anchor, anchorRef, container } = useThemePortalContainer<HTMLButtonElement>();
    const fieldBox = anchor?.parentElement ?? null;
    const popupRef = useRef<HTMLDivElement>(null);

    return (
        <BasePopover.Root open={open} onOpenChange={(nextOpen) => onOpenChange(nextOpen)}>
            <BasePopover.Trigger ref={anchorRef} type="button" className={triggerClassName} aria-label={triggerLabel} disabled={disabled}>
                <Icon name="calendar" />
            </BasePopover.Trigger>
            <BasePopover.Portal container={container}>
                <BasePopover.Positioner
                    className={styles.positioner}
                    anchor={fieldBox}
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    collisionPadding={8}
                >
                    <BasePopover.Popup
                        ref={popupRef}
                        className={styles.popup}
                        aria-labelledby={labelledBy}
                        initialFocus={() => popupRef.current?.querySelector<HTMLElement>("[data-focus-target]") ?? true}
                        finalFocus={finalFocus}
                    >
                        <Calendar {...calendarProps} />
                    </BasePopover.Popup>
                </BasePopover.Positioner>
            </BasePopover.Portal>
        </BasePopover.Root>
    );
}
