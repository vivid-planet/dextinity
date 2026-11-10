import type { EmblaCarouselType } from "embla-carousel";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseEmblaCarouselStateOptions = {
    emblaApi?: EmblaCarouselType;
};

export type EmblaCarouselState = {
    /** Number of positions the carousel can stop at. `null` until Embla has measured the slides. */
    snapCount: number | null;
    goToPrev: () => void;
    goToNext: () => void;
    goTo: (snapIndex: number) => void;
};

export const useEmblaCarouselState = ({ emblaApi }: UseEmblaCarouselStateOptions): EmblaCarouselState => {
    const [snapCount, setSnapCount] = useState<number | null>(null);

    useEffect(() => {
        if (!emblaApi) {
            return;
        }

        const syncSnapCount = () => setSnapCount(emblaApi.snapList().length);

        syncSnapCount();
        emblaApi.on("reinit", syncSnapCount);

        return () => {
            emblaApi.off("reinit", syncSnapCount);
        };
    }, [emblaApi]);

    const goToPrev = useCallback(() => emblaApi?.goToPrev(), [emblaApi]);
    const goToNext = useCallback(() => emblaApi?.goToNext(), [emblaApi]);
    const goTo = useCallback((snapIndex: number) => emblaApi?.goTo(snapIndex), [emblaApi]);

    return useMemo(() => ({ snapCount, goToPrev, goToNext, goTo }), [snapCount, goToPrev, goToNext, goTo]);
};
