import type { FormApi } from "final-form";
import { useCallback } from "react";

const fieldElementsByForm = new WeakMap<object, Map<string, HTMLElement>>();

function fieldElements(form: object) {
    let elements = fieldElementsByForm.get(form);
    if (elements == null) {
        elements = new Map();
        fieldElementsByForm.set(form, elements);
    }
    return elements;
}

export function useFieldElementRef(form: FormApi<object>, name: string) {
    return useCallback(
        (element: HTMLElement | null) => {
            const elements = fieldElements(form);
            if (element == null) {
                elements.delete(name);
            } else {
                elements.set(name, element);
            }
        },
        [form, name],
    );
}

const focusableSelector = [
    "input:not([type='hidden']):not([aria-hidden='true']):not([tabindex='-1'])",
    "textarea",
    "select",
    "button",
    "[contenteditable='true']",
    "[tabindex]:not([tabindex='-1'])",
].join(", ");

function focusTarget(element: HTMLElement): HTMLElement | null {
    if (element.matches(focusableSelector)) {
        return element;
    }
    return element.querySelector<HTMLElement>("[contenteditable='true']") ?? element.querySelector<HTMLElement>(focusableSelector);
}

export function focusFirstInvalidField(form: FormApi<object>) {
    const invalidElements = [...fieldElements(form).entries()]
        .filter(([name]) => {
            const fieldState = form.getFieldState(name as never);
            return Boolean(fieldState?.error) || Boolean(fieldState?.submitError);
        })
        .map(([, element]) => element)
        .filter((element) => element.isConnected)
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    for (const element of invalidElements) {
        const target = focusTarget(element);
        if (target != null) {
            target.focus();
            return;
        }
    }
}
