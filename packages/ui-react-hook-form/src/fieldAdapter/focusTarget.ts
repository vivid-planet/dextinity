const focusableSelector = [
    "input:not([type='hidden']):not([aria-hidden='true']):not([tabindex='-1'])",
    "textarea",
    "select",
    "button",
    "[contenteditable='true']",
    "[tabindex]:not([tabindex='-1'])",
].join(", ");

/**
 * The element to focus for a field: the ui component's root itself, or – for roots like a `<label>` or a wrapper `<div>` – the editable or
 * focusable element inside it.
 */
export function focusTarget(element: HTMLElement): HTMLElement | null {
    if (element.matches(focusableSelector)) {
        return element;
    }
    return element.querySelector<HTMLElement>("[contenteditable='true']") ?? element.querySelector<HTMLElement>(focusableSelector);
}
