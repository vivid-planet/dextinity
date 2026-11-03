import type { AccessibilityOptionsType } from "embla-carousel-accessibility";
import { useMemo } from "react";
import { useIntl } from "react-intl";

export const useEmblaAccessibilityPluginOptions = (label: string) => {
    const intl = useIntl();

    return useMemo<AccessibilityOptionsType>(
        () => ({
            carouselRole: "group",
            carouselAriaLabel: label,
            carouselAriaRoleDescription: intl.formatMessage({ id: "carousel.ariaRoleDescription", defaultMessage: "carousel" }),
            slideAriaRoleDescription: intl.formatMessage({ id: "carousel.slide.ariaRoleDescription", defaultMessage: "slide" }),
            announceChanges: true,
            previousButtonAriaLabel: intl.formatMessage({ id: "carousel.previousSlide.ariaLabel", defaultMessage: "Previous slide" }),
            nextButtonAriaLabel: intl.formatMessage({ id: "carousel.nextSlide.ariaLabel", defaultMessage: "Next slide" }),
            slideAriaLabel: (hasAnyGroupedSlides, firstSlideIndex, lastSlideIndex, totalSlides) =>
                firstSlideIndex === lastSlideIndex
                    ? intl.formatMessage(
                          { id: "carousel.slide.ariaLabel", defaultMessage: "Slide {index} of {total}" },
                          { index: firstSlideIndex + 1, total: totalSlides },
                      )
                    : intl.formatMessage(
                          { id: "carousel.slides.ariaLabel", defaultMessage: "Slides {first}–{last} of {total}" },
                          { first: firstSlideIndex + 1, last: lastSlideIndex + 1, total: totalSlides },
                      ),
            dotButtonAriaLabel: (hasAnyGroupedSlides, firstSlideIndex, lastSlideIndex) =>
                firstSlideIndex === lastSlideIndex
                    ? intl.formatMessage({ id: "carousel.dot.ariaLabel", defaultMessage: "Go to slide {index}" }, { index: firstSlideIndex + 1 })
                    : intl.formatMessage(
                          { id: "carousel.dot.range.ariaLabel", defaultMessage: "Go to slides {first}–{last}" },
                          { first: firstSlideIndex + 1, last: lastSlideIndex + 1 },
                      ),
            liveRegionContent: (hasAnyGroupedSlides, firstSlideIndex, lastSlideIndex, totalSlides) =>
                firstSlideIndex === lastSlideIndex
                    ? intl.formatMessage(
                          { id: "carousel.status", defaultMessage: "{current} of {total}" },
                          { current: firstSlideIndex + 1, total: totalSlides },
                      )
                    : intl.formatMessage(
                          { id: "carousel.status.range", defaultMessage: "{first}–{last} of {total}" },
                          { first: firstSlideIndex + 1, last: lastSlideIndex + 1, total: totalSlides },
                      ),
        }),
        [intl, label],
    );
};
