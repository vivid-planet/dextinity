import type { UseEmblaCarouselType } from "embla-carousel-react";
import { useEffect } from "react";

// Undoes native scrolling of the viewport, for example by screen readers, so only Embla moves the slides.
export const useResetNativeScroll = (emblaApi: UseEmblaCarouselType[1]) => {
    useEffect(() => {
        if (!emblaApi) {
            return;
        }

        const viewport = emblaApi.rootNode();

        const resetNativeScroll = () => {
            viewport.scrollLeft = 0;
        };

        viewport.addEventListener("scroll", resetNativeScroll, { passive: true });

        return () => {
            viewport.removeEventListener("scroll", resetNativeScroll);
        };
    }, [emblaApi]);
};
