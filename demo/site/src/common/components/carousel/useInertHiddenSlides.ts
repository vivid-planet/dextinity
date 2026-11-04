import type { EmblaCarouselType } from "embla-carousel";
import { useEffect } from "react";

type UseInertHiddenSlidesOptions = {
    emblaApi?: EmblaCarouselType;
};

// The accessibility plugin of Embla only makes the elements unfocusable that exist when it initializes,
// but not elements that are rendered later, for example the play button of a YouTube video.
export const useInertHiddenSlides = ({ emblaApi }: UseInertHiddenSlidesOptions) => {
    useEffect(() => {
        if (!emblaApi) {
            return;
        }

        const syncInertWithAriaHidden = () => {
            for (const slide of emblaApi.slideNodes()) {
                slide.inert = slide.getAttribute("aria-hidden") === "true";
            }
        };

        syncInertWithAriaHidden();

        const observer = new MutationObserver(syncInertWithAriaHidden);
        observer.observe(emblaApi.containerNode(), { attributeFilter: ["aria-hidden"], subtree: true });

        return () => {
            observer.disconnect();
        };
    }, [emblaApi]);
};
