import { useEventListener } from "usehooks-ts";

export const useEscapeKeyPressed = (keyPressed: () => void) => {
    useEventListener(
        "keydown",
        (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                keyPressed();
            }
        },
        undefined,
    );
};
