import { CarouselAccessibility, type CarouselState, useCarouselState } from "@dextinity/site-nextjs";
import clsx from "clsx";
import type { EmblaOptionsType } from "embla-carousel";
import AutoHeight from "embla-carousel-auto-height";
import useEmblaCarousel, { type EmblaViewportRefType } from "embla-carousel-react";
import { type ComponentProps, createContext, type ElementType, type PropsWithChildren, useContext, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import styles from "./Carousel.module.scss";

type CarouselContextValue = CarouselState & {
    viewportRef: EmblaViewportRefType;
    slideCount: number;
    hasNavigation: boolean;
};

const CarouselContext = createContext<CarouselContextValue | null>(null);

const useCarousel = () => {
    const context = useContext(CarouselContext);

    if (!context) {
        throw new Error("Carousel sub components must be rendered inside a Carousel.");
    }

    return context;
};

const emblaOptions: EmblaOptionsType = {
    align: "start",
    // Slides out of view are inert, so Embla doesn't need to scroll to focused slides.
    watchFocus: false,
    breakpoints: {
        "(prefers-reduced-motion: reduce)": { duration: 0 },
    },
};

const getCarouselRoot = (viewport: HTMLElement) => viewport.closest<HTMLElement>('[aria-roledescription="carousel"]');

type CarouselProps = PropsWithChildren<{
    label: string;
    slideCount: number;
    className?: string;
}>;

export const Carousel = ({ label, slideCount, className, children }: CarouselProps) => {
    const emblaPlugins = useMemo(() => [CarouselAccessibility({ rootNode: getCarouselRoot }), AutoHeight()], []);
    const [viewportRef, emblaApi] = useEmblaCarousel(emblaOptions, emblaPlugins);
    const carouselState = useCarouselState({ emblaApi, slideCount });

    const contextValue = useMemo<CarouselContextValue>(
        () => ({ ...carouselState, viewportRef, slideCount, hasNavigation: carouselState.snapCount > 1 }),
        [carouselState, viewportRef, slideCount],
    );

    return (
        <CarouselContext.Provider value={contextValue}>
            <div role="group" aria-roledescription="carousel" aria-label={label} tabIndex={-1} className={clsx(styles.root, className)}>
                {children}
            </div>
        </CarouselContext.Provider>
    );
};

type CarouselViewportProps = PropsWithChildren<{
    className?: string;
    containerClassName?: string;
}>;

export const CarouselViewport = ({ className, containerClassName, children }: CarouselViewportProps) => {
    const { viewportRef } = useCarousel();

    return (
        <div ref={viewportRef} className={clsx(styles.viewport, className)}>
            <div className={clsx(styles.container, containerClassName)}>{children}</div>
        </div>
    );
};

type CarouselSlideProps = PropsWithChildren<{
    index: number;
    className?: string;
    inViewClassName?: string;
}>;

export const CarouselSlide = ({ index, className, inViewClassName, children }: CarouselSlideProps) => {
    const { slidesInView, slideCount } = useCarousel();
    const intl = useIntl();
    // Until Embla has measured the slides, the first slide is assumed to be in view.
    const isInView = slidesInView?.includes(index) ?? index === 0;

    return (
        <div
            role="group"
            aria-roledescription="slide"
            aria-label={intl.formatMessage(
                { id: "carousel.slide.ariaLabel", defaultMessage: "Slide {index} of {total}" },
                { index: index + 1, total: slideCount },
            )}
            className={clsx(styles.slide, className, isInView && inViewClassName)}
        >
            {children}
        </div>
    );
};

type CarouselButtonProps = Omit<ComponentProps<"button">, "aria-disabled" | "disabled" | "onClick" | "ref" | "type">;

export const CarouselPreviousButton = ({ className, ...restProps }: CarouselButtonProps) => {
    const { hasNavigation, canScrollPrev, scrollPrev } = useCarousel();
    const intl = useIntl();

    if (!hasNavigation) {
        return null;
    }

    return (
        <button
            type="button"
            aria-disabled={!canScrollPrev}
            aria-label={intl.formatMessage({ id: "carousel.previousSlide.ariaLabel", defaultMessage: "Previous slide" })}
            onClick={scrollPrev}
            className={clsx(styles.button, className)}
            {...restProps}
        />
    );
};

export const CarouselNextButton = ({ className, ...restProps }: CarouselButtonProps) => {
    const { hasNavigation, canScrollNext, scrollNext } = useCarousel();
    const intl = useIntl();

    if (!hasNavigation) {
        return null;
    }

    return (
        <button
            type="button"
            aria-disabled={!canScrollNext}
            aria-label={intl.formatMessage({ id: "carousel.nextSlide.ariaLabel", defaultMessage: "Next slide" })}
            onClick={scrollNext}
            className={clsx(styles.button, className)}
            {...restProps}
        />
    );
};

type CarouselDotsProps = {
    className?: string;
    dotClassName?: string;
    selectedDotClassName?: string;
};

export const CarouselDots = ({ className, dotClassName, selectedDotClassName }: CarouselDotsProps) => {
    const { hasNavigation, snapCount, selectedSnapIndex, scrollTo } = useCarousel();
    const intl = useIntl();

    if (!hasNavigation) {
        return null;
    }

    return (
        <div className={clsx(styles.dots, className)}>
            {Array.from({ length: snapCount }, (_, index) => {
                const isSelected = index === selectedSnapIndex;

                return (
                    <button
                        key={index}
                        type="button"
                        aria-current={isSelected}
                        aria-label={intl.formatMessage({ id: "carousel.dot.ariaLabel", defaultMessage: "Go to slide {index}" }, { index: index + 1 })}
                        onClick={() => scrollTo(index)}
                        className={clsx(styles.dot, dotClassName, isSelected && selectedDotClassName)}
                    />
                );
            })}
        </div>
    );
};

type CarouselStatusProps<T extends ElementType> = {
    as?: T;
} & Omit<ComponentProps<T>, "aria-atomic" | "aria-live" | "children" | "role">;

export const CarouselStatus = <T extends ElementType = "p">(props: CarouselStatusProps<T>) => {
    const { as: Component = "p", ...restProps } = props;
    const { hasNavigation, selectedSnapIndex, slidesInView, slideCount } = useCarousel();

    if (!hasNavigation) {
        return null;
    }

    const first = slidesInView?.length ? Math.min(...slidesInView) : selectedSnapIndex;
    const last = slidesInView?.length ? Math.max(...slidesInView) : selectedSnapIndex;

    return (
        <Component role="status" aria-live="polite" aria-atomic="true" {...restProps}>
            {first === last ? (
                <FormattedMessage id="carousel.status" defaultMessage="{current} of {total}" values={{ current: first + 1, total: slideCount }} />
            ) : (
                <FormattedMessage
                    id="carousel.status.range"
                    defaultMessage="{first}–{last} of {total}"
                    values={{ first: first + 1, last: last + 1, total: slideCount }}
                />
            )}
        </Component>
    );
};
