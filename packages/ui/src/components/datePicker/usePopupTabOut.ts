import { type KeyboardEvent, type RefObject, useRef } from "react";

function tabbablesIn(root: ParentNode): HTMLElement[] {
    return Array.from(root.querySelectorAll<HTMLElement>("a[href], button, input, select, textarea, [tabindex]")).filter(
        (element) =>
            element.tabIndex >= 0 &&
            !element.matches(":disabled, input[type='hidden'], [data-base-ui-focus-guard]") &&
            element.getClientRects().length > 0,
    );
}

/**
 * Tab from the last element of a popup closes it and moves focus to whatever follows its trigger, as if the popup sat right after the
 * trigger, or to the trigger when nothing follows. Base UI moves it past the positioner's anchor instead, and since the anchor is the
 * field box around the trigger, focus would land on the field's first input.
 */
export function usePopupTabOut({
    trigger,
    finalFocus,
    onClose,
}: {
    trigger: HTMLElement | null;
    /** The element focused when the popup closes in any other way. */
    finalFocus: RefObject<HTMLElement | null>;
    onClose: () => void;
}) {
    const tabbedOutRef = useRef(false);

    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key !== "Tab" || event.shiftKey || trigger == null) {
            return;
        }
        const popup = event.currentTarget;
        const inside = tabbablesIn(popup);
        if (inside[inside.length - 1] !== event.target) {
            return;
        }
        const next = tabbablesIn(trigger.ownerDocument).find(
            (element) => !popup.contains(element) && Boolean(trigger.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING),
        );
        event.preventDefault();
        tabbedOutRef.current = true;
        (next ?? trigger).focus();
        onClose();
    };

    const resolveFinalFocus = () => {
        if (tabbedOutRef.current) {
            tabbedOutRef.current = false;
            return false;
        }
        return finalFocus.current;
    };

    return { onKeyDown, finalFocus: resolveFinalFocus };
}
