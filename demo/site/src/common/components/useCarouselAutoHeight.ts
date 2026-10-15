import type { UseEmblaCarouselType } from "embla-carousel-react";
import { useEffect } from "react";

export const useCarouselAutoHeight = (emblaApi: UseEmblaCarouselType[1], slidesInView: number[] | null) => {
    useEffect(() => {
        if (!emblaApi || slidesInView === null) {
            return;
        }

        const container = emblaApi.containerNode();
        const visibleSlides = slidesInView.map((index) => emblaApi.slideNodes()[index]).filter((slide) => slide !== undefined);

        const updateHeight = () => {
            container.style.height = `${Math.max(...visibleSlides.map((slide) => slide.offsetHeight))}px`;
        };

        updateHeight();

        const resizeObserver = new ResizeObserver(updateHeight);
        visibleSlides.forEach((slide) => resizeObserver.observe(slide));

        return () => {
            resizeObserver.disconnect();
        };
    }, [emblaApi, slidesInView]);
};
