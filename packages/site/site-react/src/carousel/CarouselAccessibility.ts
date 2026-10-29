import type { CreateOptionsType, CreatePluginType, EmblaCarouselType } from "embla-carousel";

import { getSlidesInViewAtSnap } from "./getSlidesInView";

type OptionsType = CreateOptionsType<{
    /**
     * Returns the element that handles the arrow keys and receives the focus when the focused element scrolls out of view or
     * is removed. Defaults to the viewport.
     */
    rootNode: ((viewport: HTMLElement) => HTMLElement | null) | null;
}>;

export type CarouselAccessibilityOptions = Partial<OptionsType>;

export type CarouselAccessibilityType = CreatePluginType<Record<never, never>, OptionsType>;

const defaultOptions: OptionsType = {
    active: true,
    breakpoints: {},
    rootNode: null,
};

const arrowKeyConsumerSelector = [
    "input",
    "textarea",
    "select",
    '[contenteditable]:not([contenteditable="false"])',
    '[role="slider"]',
    '[role="spinbutton"]',
    '[role="textbox"]',
].join(", ");

const consumesArrowKeys = (target: EventTarget | null) => target instanceof Element && target.closest(arrowKeyConsumerSelector) !== null;

// For example, Alt+← navigates back in the browser history on Windows and Linux.
const hasModifierKey = (event: KeyboardEvent) => event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

/**
 * Makes slides that aren't fully in view inert, scrolls with the arrow keys and keeps the focus in the carousel when the
 * focused element scrolls out of view or is removed. Use it with `watchFocus: false`, because Embla would otherwise scroll
 * to every focused slide, although all focusable slides are already in view.
 *
 * Doesn't support `loop`, `axis: "y"` and `direction: "rtl"`.
 */
export const CarouselAccessibility = (userOptions: CarouselAccessibilityOptions = {}): CarouselAccessibilityType => {
    let emblaApi: EmblaCarouselType | null = null;
    let rootNode: HTMLElement | null = null;
    let lastFocusedElement: Element | null = null;
    let mutationObserver: MutationObserver | null = null;

    const updateInertSlides = () => {
        if (!emblaApi) {
            return;
        }

        const slidesInView = getSlidesInViewAtSnap(emblaApi, emblaApi.selectedScrollSnap());

        for (const [index, slide] of emblaApi.slideNodes().entries()) {
            const isInView = slidesInView.includes(index);

            // An inert slide would move its focus to the document body.
            if (!isInView && slide.contains(document.activeElement)) {
                rootNode?.focus();
            }

            slide.inert = !isInView;
        }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        // A nested carousel has already handled the key.
        if (
            !emblaApi ||
            event.defaultPrevented ||
            (event.key !== "ArrowLeft" && event.key !== "ArrowRight") ||
            hasModifierKey(event) ||
            consumesArrowKeys(event.target)
        ) {
            return;
        }

        event.preventDefault();

        if (event.key === "ArrowLeft") {
            emblaApi.scrollPrev();
        } else {
            emblaApi.scrollNext();
        }
    };

    const rememberFocusedElement = (event: FocusEvent) => {
        lastFocusedElement = event.target instanceof Element ? event.target : null;
    };

    const forgetFocusedElement = (event: FocusEvent) => {
        if (event.relatedTarget instanceof Node && !rootNode?.contains(event.relatedTarget)) {
            lastFocusedElement = null;
        }
    };

    // A focused element that is removed, for example a dot when there are fewer snaps after a resize, moves the focus to the document body.
    const recoverLostFocus = () => {
        if (lastFocusedElement && !lastFocusedElement.isConnected && (document.activeElement === null || document.activeElement === document.body)) {
            rootNode?.focus();
        }
    };

    // Screen readers scroll the viewport natively to reach elements, which would move the slides out of sync with Embla.
    const resetNativeScroll = (event: Event) => {
        if (event.currentTarget instanceof HTMLElement) {
            event.currentTarget.scrollLeft = 0;
        }
    };

    return {
        name: "carouselAccessibility",
        options: userOptions,
        init: (emblaApiInstance, { mergeOptions, optionsAtMedia }) => {
            const options = optionsAtMedia(mergeOptions(defaultOptions, userOptions));

            if (!options.active) {
                return;
            }

            const viewport = emblaApiInstance.rootNode();
            emblaApi = emblaApiInstance;
            rootNode = options.rootNode?.(viewport) ?? viewport;

            // Isn't removed on destroy, because Embla destroys plugins on every reInit, and a focused root would lose the focus.
            if (!rootNode.hasAttribute("tabindex")) {
                rootNode.tabIndex = -1;
            }

            lastFocusedElement = rootNode.contains(document.activeElement) ? document.activeElement : null;

            rootNode.addEventListener("keydown", handleKeyDown);
            rootNode.addEventListener("focusin", rememberFocusedElement);
            rootNode.addEventListener("focusout", forgetFocusedElement);
            viewport.addEventListener("scroll", resetNativeScroll, { passive: true });
            mutationObserver = new MutationObserver(recoverLostFocus);
            mutationObserver.observe(rootNode, { childList: true, subtree: true });
            emblaApi.on("select", updateInertSlides);

            updateInertSlides();
        },
        destroy: () => {
            if (!emblaApi || !rootNode) {
                return;
            }

            emblaApi.off("select", updateInertSlides);
            mutationObserver?.disconnect();
            emblaApi.rootNode().removeEventListener("scroll", resetNativeScroll);
            rootNode.removeEventListener("focusout", forgetFocusedElement);
            rootNode.removeEventListener("focusin", rememberFocusedElement);
            rootNode.removeEventListener("keydown", handleKeyDown);

            for (const slide of emblaApi.slideNodes()) {
                slide.inert = false;
            }

            emblaApi = null;
            rootNode = null;
            mutationObserver = null;
        },
    };
};
