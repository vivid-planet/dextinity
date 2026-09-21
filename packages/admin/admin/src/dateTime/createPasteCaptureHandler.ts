import type { ClipboardEvent } from "react";

export type RangePosition = "start" | "end";

type CreatePasteCaptureHandlerOptions<Value> = {
    disabled?: boolean;
    readOnly?: boolean;
    /**
     * Parses the pasted text. Returning `null` leaves the paste to the picker.
     */
    parsePastedValue: (pastedText: string) => Value | null;
    /**
     * Applies the parsed value. For range pickers, `rangePosition` tells which of the two dates was pasted into.
     */
    applyPastedValue: (value: Value, rangePosition: RangePosition) => void;
};

/**
 * The pickers only understand pasted text in their display format and clear the value for anything else. The returned
 * handler runs in the capture phase, which allows applying values the picker doesn't understand (e.g. ISO dates) before
 * it handles the paste itself. Pastes without a parsable value are left to the picker.
 */
export const createPasteCaptureHandler =
    <Value>({ disabled, readOnly, parsePastedValue, applyPastedValue }: CreatePasteCaptureHandlerOptions<Value>) =>
    (event: ClipboardEvent<HTMLDivElement>) => {
        if (disabled || readOnly) {
            return;
        }

        const pastedValue = parsePastedValue(event.clipboardData.getData("text"));

        if (pastedValue === null) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        applyPastedValue(pastedValue, getRangePosition(event));
    };

/**
 * Single input range fields mark their sections with `data-range-position`, multi input range fields mark each input
 * with `data-multi-input`. Non-range fields have neither and always paste into the one value they hold.
 */
const getRangePosition = (event: ClipboardEvent<HTMLDivElement>): RangePosition => {
    const target = event.target instanceof Element ? event.target : null;
    const positionElement = target?.closest("[data-range-position], [data-multi-input]");
    const position = positionElement?.getAttribute("data-range-position") ?? positionElement?.getAttribute("data-multi-input");

    return position === "end" ? "end" : "start";
};
