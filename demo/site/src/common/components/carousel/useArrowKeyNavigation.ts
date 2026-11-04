import type { EmblaCarouselType } from "embla-carousel";
import { useEffect } from "react";

type UseArrowKeyNavigationOptions = {
    emblaApi?: EmblaCarouselType;
    /** Returns the element that handles the arrow keys, for example the element that also contains the buttons. */
    getRootNode: (viewport: HTMLElement) => HTMLElement | null;
};

const arrowKeyConsumerSelector = [
    "input",
    "textarea",
    "select",
    "audio[controls]",
    "video[controls]",
    '[contenteditable]:not([contenteditable="false"])',
    '[role="slider"]',
    '[role="spinbutton"]',
    '[role="textbox"]',
].join(", ");

const consumesArrowKeys = (target: EventTarget | null) => target instanceof Element && target.closest(arrowKeyConsumerSelector) !== null;

// For example, Alt+← navigates back in the browser history on Windows and Linux.
const hasModifierKey = (event: KeyboardEvent) => event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

// The accessibility plugin of Embla doesn't support the arrow keys.
export const useArrowKeyNavigation = ({ emblaApi, getRootNode }: UseArrowKeyNavigationOptions) => {
    useEffect(() => {
        const rootNode = emblaApi ? getRootNode(emblaApi.rootNode()) : null;

        if (!emblaApi || !rootNode) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            // A nested carousel has already handled the key.
            if (
                event.defaultPrevented ||
                (event.key !== "ArrowLeft" && event.key !== "ArrowRight") ||
                hasModifierKey(event) ||
                consumesArrowKeys(event.target)
            ) {
                return;
            }

            event.preventDefault();

            const isPrevious = event.key === "ArrowLeft";

            if (!(isPrevious ? emblaApi.canGoToPrev() : emblaApi.canGoToNext())) {
                return;
            }

            // The focused slide scrolls out of view, and the plugin makes its elements unfocusable.
            if (emblaApi.containerNode().contains(document.activeElement)) {
                emblaApi.rootNode().focus();
            }

            if (isPrevious) {
                emblaApi.goToPrev();
            } else {
                emblaApi.goToNext();
            }
        };

        rootNode.addEventListener("keydown", handleKeyDown);

        return () => {
            rootNode.removeEventListener("keydown", handleKeyDown);
        };
    }, [emblaApi, getRootNode]);
};
