"use client";

import type { EmblaCarouselType } from "embla-carousel";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getSlidesInViewAtSnap } from "./getSlidesInView";

type UseCarouselStateOptions = {
    emblaApi: EmblaCarouselType | undefined;
    slideCount: number;
};

export type CarouselState = {
    /** Number of positions the carousel can stop at. Equals the slide count until Embla has measured the slides. */
    snapCount: number;
    selectedSnapIndex: number;
    /** Fully visible slides at the target of the current scroll. `null` until Embla has measured the slides. */
    slidesInView: number[] | null;
    canScrollPrev: boolean;
    canScrollNext: boolean;
    scrollPrev: () => void;
    scrollNext: () => void;
    scrollTo: (index: number) => void;
};

export const useCarouselState = ({ emblaApi, slideCount }: UseCarouselStateOptions): CarouselState => {
    const [snapCount, setSnapCount] = useState(slideCount);
    const [selectedSnapIndex, setSelectedSnapIndex] = useState(0);
    const [slidesInView, setSlidesInView] = useState<number[] | null>(null);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    useEffect(() => {
        if (!emblaApi) {
            return;
        }

        const syncState = () => {
            const selectedSnap = emblaApi.selectedScrollSnap();

            setSnapCount(emblaApi.scrollSnapList().length);
            setSelectedSnapIndex(selectedSnap);
            // Uses the target of the scroll, because Embla's `slidesInView()` only updates after the animation has ended.
            setSlidesInView(getSlidesInViewAtSnap(emblaApi, selectedSnap));
            setCanScrollPrev(emblaApi.canScrollPrev());
            setCanScrollNext(emblaApi.canScrollNext());
        };

        syncState();
        emblaApi.on("select", syncState).on("reInit", syncState);

        return () => {
            emblaApi.off("select", syncState).off("reInit", syncState);
        };
    }, [emblaApi]);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

    return useMemo(
        () => ({ snapCount, selectedSnapIndex, slidesInView, canScrollPrev, canScrollNext, scrollPrev, scrollNext, scrollTo }),
        [snapCount, selectedSnapIndex, slidesInView, canScrollPrev, canScrollNext, scrollPrev, scrollNext, scrollTo],
    );
};
