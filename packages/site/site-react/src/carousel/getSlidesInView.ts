import type { EmblaCarouselType } from "embla-carousel";

type SlideBounds = {
    start: number;
    end: number;
};

type GetSlidesInViewOptions = {
    slides: SlideBounds[];
    viewportSize: number;
    /** Scroll progress of the scroll snap, between 0 and 1, as returned by Embla's `scrollSnapList()`. */
    scrollProgress: number;
};

// Offsets are rounded to whole pixels.
const tolerance = 1;

export const getSlidesInView = ({ slides, viewportSize, scrollProgress }: GetSlidesInViewOptions) => {
    if (slides.length === 0) {
        return [];
    }

    const contentStart = Math.min(...slides.map((slide) => slide.start));
    const contentEnd = Math.max(...slides.map((slide) => slide.end));
    const scrollLength = Math.max(0, contentEnd - contentStart - viewportSize);
    const viewStart = contentStart + scrollProgress * scrollLength;
    const viewEnd = viewStart + viewportSize;

    const fullyVisibleSlides = slides.flatMap((slide, index) =>
        slide.start >= viewStart - tolerance && slide.end <= viewEnd + tolerance ? [index] : [],
    );

    if (fullyVisibleSlides.length > 0) {
        return fullyVisibleSlides;
    }

    // A slide wider than the viewport is never fully visible, but its content has to stay reachable.
    const visibleSizes = slides.map((slide) => Math.min(slide.end, viewEnd) - Math.max(slide.start, viewStart));
    const largestVisibleSize = Math.max(...visibleSizes);

    return largestVisibleSize > 0 ? [visibleSizes.indexOf(largestVisibleSize)] : [];
};

export const getSlidesInViewAtSnap = (emblaApi: EmblaCarouselType, snapIndex: number) =>
    getSlidesInView({
        slides: emblaApi.slideNodes().map((slide) => ({ start: slide.offsetLeft, end: slide.offsetLeft + slide.offsetWidth })),
        viewportSize: emblaApi.rootNode().clientWidth,
        scrollProgress: emblaApi.scrollSnapList()[snapIndex] ?? 0,
    });
