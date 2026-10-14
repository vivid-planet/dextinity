import type { UseEmblaCarouselType } from "embla-carousel-react";
import type { KeyboardEvent } from "react";

const arrowKeyConsumerSelector = [
    "input",
    "textarea",
    "select",
    '[contenteditable]:not([contenteditable="false"])',
    '[role="slider"]',
    '[role="spinbutton"]',
    '[role="textbox"]',
].join(", ");

const consumesArrowKeys = (target: EventTarget) => target instanceof Element && target.closest(arrowKeyConsumerSelector) !== null;

type UseCarouselKeyboardNavigationOptions = {
    emblaApi: UseEmblaCarouselType[1];
    selectedIndex: number;
    slidesPerView: number | null;
    canScrollPrev: boolean;
    canScrollNext: boolean;
};

export const useCarouselKeyboardNavigation = ({
    emblaApi,
    selectedIndex,
    slidesPerView,
    canScrollPrev,
    canScrollNext,
}: UseCarouselKeyboardNavigationOptions) => {
    return (event: KeyboardEvent<HTMLElement>) => {
        if (!emblaApi || (event.key !== "ArrowLeft" && event.key !== "ArrowRight") || consumesArrowKeys(event.target)) {
            return;
        }

        event.preventDefault();

        const isPrevious = event.key === "ArrowLeft";

        if (isPrevious ? !canScrollPrev : !canScrollNext) {
            return;
        }

        const focusedSlideIndex = emblaApi.slideNodes().findIndex((slide) => slide.contains(event.target as Node));

        if (focusedSlideIndex !== -1) {
            const targetIndex = selectedIndex + (isPrevious ? -1 : 1);

            if (focusedSlideIndex < targetIndex || focusedSlideIndex >= targetIndex + (slidesPerView ?? 1)) {
                event.currentTarget.focus();
            }
        }

        if (isPrevious) {
            emblaApi.scrollPrev();
        } else {
            emblaApi.scrollNext();
        }
    };
};
