import { type RefObject, useEffect, useRef } from "react";

/**
 * Calls `onReset` when the form of the input is reset, e.g. by a reset button, unless a reset handler cancels the reset.
 */
export function useFormReset(inputRef: RefObject<HTMLInputElement | null>, onReset: () => void) {
    const onResetRef = useRef(onReset);
    useEffect(() => {
        onResetRef.current = onReset;
    }, [onReset]);

    useEffect(() => {
        const form = inputRef.current?.form;
        if (form == null) {
            return;
        }
        // The reset handlers of React run after this listener, so whether the reset was canceled is only known once the event is done
        let dispatchedResetEvents: Event[] = [];
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        const handleReset = (event: Event) => {
            dispatchedResetEvents.push(event);
            timeoutId ??= setTimeout(() => {
                const isFormReset = dispatchedResetEvents.some((resetEvent) => !resetEvent.defaultPrevented);
                dispatchedResetEvents = [];
                timeoutId = undefined;
                if (isFormReset) {
                    onResetRef.current();
                }
            });
        };
        form.addEventListener("reset", handleReset);
        return () => {
            form.removeEventListener("reset", handleReset);
            clearTimeout(timeoutId);
        };
    }, [inputRef]);
}
