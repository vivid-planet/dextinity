import type { UseEmblaCarouselType } from "embla-carousel-react";
import { type RefObject, useEffect, useMemo, useState } from "react";

type EmblaApi = UseEmblaCarouselType[1];

const countSlidesPerView = (emblaApi: NonNullable<EmblaApi>) => {
    const [firstSlide, secondSlide] = emblaApi.slideNodes();

    if (!firstSlide) {
        return 1;
    }

    const gap = secondSlide ? secondSlide.offsetLeft - firstSlide.offsetLeft - firstSlide.offsetWidth : 0;
    return Math.max(1, Math.floor((emblaApi.rootNode().clientWidth + gap) / (firstSlide.offsetWidth + gap) + 0.05));
};

type UseCarouselStateOptions = {
    emblaApi: EmblaApi;
    slideCount: number;
    rootRef: RefObject<HTMLElement | null>;
    previousButtonRef: RefObject<HTMLButtonElement | null>;
    nextButtonRef: RefObject<HTMLButtonElement | null>;
    dotRefs: RefObject<(HTMLButtonElement | null)[]>;
};

export const useCarouselState = ({ emblaApi, slideCount, rootRef, previousButtonRef, nextButtonRef, dotRefs }: UseCarouselStateOptions) => {
    // Number of positions the carousel can stop at: slides minus fully visible slides plus one.
    const [snapCount, setSnapCount] = useState(slideCount);
    const [slidesPerView, setSlidesPerView] = useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    useEffect(() => {
        if (!emblaApi) {
            return;
        }

        const moveFocusTo = (button: HTMLButtonElement | null, isButtonEnabled: boolean) => {
            if (button && isButtonEnabled) {
                button.disabled = false;
                button.focus();
            } else {
                rootRef.current?.focus();
            }
        };

        const syncSelection = () => {
            const canScrollPrevAfterSelect = emblaApi.canScrollPrev();
            const canScrollNextAfterSelect = emblaApi.canScrollNext();

            if (document.activeElement === previousButtonRef.current && !canScrollPrevAfterSelect) {
                moveFocusTo(nextButtonRef.current, canScrollNextAfterSelect);
            } else if (document.activeElement === nextButtonRef.current && !canScrollNextAfterSelect) {
                moveFocusTo(previousButtonRef.current, canScrollPrevAfterSelect);
            }

            setSelectedIndex(emblaApi.selectedScrollSnap());
            setCanScrollPrev(canScrollPrevAfterSelect);
            setCanScrollNext(canScrollNextAfterSelect);
        };

        const syncLayout = () => {
            const snapCountAfterLayout = emblaApi.scrollSnapList().length;
            const isNavigationRemoved = snapCountAfterLayout <= 1;
            const focusedDotIndex = dotRefs.current.findIndex((dot) => dot !== null && dot === document.activeElement);
            const isFocusedDotRemoved = focusedDotIndex !== -1 && (isNavigationRemoved || focusedDotIndex >= snapCountAfterLayout);
            const isFocusedButtonRemoved =
                isNavigationRemoved && (document.activeElement === previousButtonRef.current || document.activeElement === nextButtonRef.current);

            if (isFocusedDotRemoved || isFocusedButtonRemoved) {
                rootRef.current?.focus();
            }

            setSnapCount(snapCountAfterLayout);
            setSlidesPerView(countSlidesPerView(emblaApi));
            syncSelection();
        };

        syncLayout();
        emblaApi.on("select", syncSelection).on("reInit", syncLayout);

        return () => {
            emblaApi.off("select", syncSelection).off("reInit", syncLayout);
        };
    }, [emblaApi, rootRef, previousButtonRef, nextButtonRef, dotRefs]);

    const slidesInView = useMemo(
        () =>
            slidesPerView === null
                ? null
                : Array.from({ length: Math.min(slidesPerView, slideCount - selectedIndex) }, (_, offset) => selectedIndex + offset),
        [slidesPerView, slideCount, selectedIndex],
    );

    return { snapCount, slidesPerView, selectedIndex, slidesInView, canScrollPrev, canScrollNext };
};
