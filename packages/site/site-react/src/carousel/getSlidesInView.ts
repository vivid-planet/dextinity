import type { EmblaCarouselType } from "embla-carousel";

type SlideBounds = {
    start: number;
    end: number;
};

type GetSlidesInViewOptions = {
    /** Positions of the slides relative to the start of the viewport. */
    slides: SlideBounds[];
    viewportSize: number;
};

// Rectangles can be off by fractions of a pixel.
const tolerance = 1;

export const getSlidesInView = ({ slides, viewportSize }: GetSlidesInViewOptions) => {
    const fullyVisibleSlides = slides.flatMap((slide, index) => (slide.start >= -tolerance && slide.end <= viewportSize + tolerance ? [index] : []));

    if (fullyVisibleSlides.length > 0 || slides.length === 0) {
        return fullyVisibleSlides;
    }

    // A slide wider than the viewport is never fully visible, but its content has to stay reachable.
    const visibleSizes = slides.map((slide) => Math.min(slide.end, viewportSize) - Math.max(slide.start, 0));
    const largestVisibleSize = Math.max(...visibleSizes);

    return largestVisibleSize > 0 ? [visibleSizes.indexOf(largestVisibleSize)] : [];
};

export const getSlidesInViewAtSnap = (emblaApi: EmblaCarouselType, snapIndex: number) => {
    const engine = emblaApi.internalEngine();
    const viewport = emblaApi.rootNode().getBoundingClientRect();
    // The slides are measured at the current position and moved by the distance to the snap, because Embla is still animating.
    const distanceToSnap = (engine.scrollSnaps[snapIndex] ?? engine.offsetLocation.get()) - engine.offsetLocation.get();

    return getSlidesInView({
        slides: emblaApi.slideNodes().map((slide) => {
            const rect = slide.getBoundingClientRect();
            return { start: rect.left - viewport.left + distanceToSnap, end: rect.right - viewport.left + distanceToSnap };
        }),
        viewportSize: viewport.width,
    });
};
