import type { FormApi } from "final-form";
import { useCallback, useRef } from "react";

// A name can have several elements, e.g. the boxes of a checkbox group
const fieldElementsByForm = new WeakMap<object, Map<string, Set<HTMLElement>>>();

function fieldElements(form: object) {
    let elements = fieldElementsByForm.get(form);
    if (elements == null) {
        elements = new Map();
        fieldElementsByForm.set(form, elements);
    }
    return elements;
}

export function useFieldElementRef(form: FormApi<object>, name: string) {
    const registeredElement = useRef<HTMLElement | null>(null);
    return useCallback(
        (element: HTMLElement | null) => {
            const elements = fieldElements(form);
            const previous = registeredElement.current;
            if (previous != null) {
                elements.get(name)?.delete(previous);
                if (elements.get(name)?.size === 0) {
                    elements.delete(name);
                }
            }
            registeredElement.current = element;
            if (element != null) {
                const elementsOfName = elements.get(name) ?? new Set();
                elementsOfName.add(element);
                elements.set(name, elementsOfName);
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
        .flatMap(([, elements]) => [...elements])
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
