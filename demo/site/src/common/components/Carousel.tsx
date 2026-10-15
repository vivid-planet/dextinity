import clsx from "clsx";
import useEmblaCarousel, { type EmblaViewportRefType } from "embla-carousel-react";
import {
    type ComponentProps,
    createContext,
    type ElementType,
    type PropsWithChildren,
    type RefObject,
    useCallback,
    useContext,
    useMemo,
    useRef,
} from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useMediaQuery } from "usehooks-ts";

import styles from "./Carousel.module.scss";
import { useCarouselKeyboardNavigation } from "./useCarouselKeyboardNavigation";
import { useCarouselState } from "./useCarouselState";
import { useResetNativeScroll } from "./useResetNativeScroll";

type EmblaOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>;

type CarouselContextValue = {
    viewportRef: EmblaViewportRefType;
    previousButtonRef: RefObject<HTMLButtonElement | null>;
    nextButtonRef: RefObject<HTMLButtonElement | null>;
    dotRefs: RefObject<(HTMLButtonElement | null)[]>;
    slideCount: number;
    hasNavigation: boolean;
    snapCount: number;
    selectedIndex: number;
    slidesInView: number[] | null;
    canScrollPrev: boolean;
    canScrollNext: boolean;
    scrollPrev: () => void;
    scrollNext: () => void;
    scrollTo: (index: number) => void;
};

const CarouselContext = createContext<CarouselContextValue | null>(null);

const useCarousel = () => {
    const context = useContext(CarouselContext);

    if (!context) {
        throw new Error("Carousel sub components must be rendered inside a Carousel.");
    }

    return context;
};

type CarouselProps = PropsWithChildren<{
    label: string;
    slideCount: number;
    className?: string;
    options?: Omit<EmblaOptions, "align" | "slidesToScroll" | "watchFocus">;
}>;

export const Carousel = ({ label, slideCount, className, options, children }: CarouselProps) => {
    const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
    const emblaOptions = useMemo<EmblaOptions>(
        () => ({ ...options, align: "start", slidesToScroll: 1, watchFocus: false, ...(prefersReducedMotion && { duration: 0 }) }),
        [options, prefersReducedMotion],
    );
    const [viewportRef, emblaApi] = useEmblaCarousel(emblaOptions);
    const rootRef = useRef<HTMLDivElement>(null);
    const previousButtonRef = useRef<HTMLButtonElement>(null);
    const nextButtonRef = useRef<HTMLButtonElement>(null);
    const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const { snapCount, slidesPerView, selectedIndex, slidesInView, canScrollPrev, canScrollNext } = useCarouselState({
        emblaApi,
        slideCount,
        rootRef,
        previousButtonRef,
        nextButtonRef,
        dotRefs,
    });
    useResetNativeScroll(emblaApi);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

    const contextValue = useMemo<CarouselContextValue>(
        () => ({
            viewportRef,
            previousButtonRef,
            nextButtonRef,
            dotRefs,
            slideCount,
            hasNavigation: snapCount > 1,
            snapCount,
            selectedIndex,
            slidesInView,
            canScrollPrev,
            canScrollNext,
            scrollPrev,
            scrollNext,
            scrollTo,
        }),
        [viewportRef, slideCount, snapCount, selectedIndex, slidesInView, canScrollPrev, canScrollNext, scrollPrev, scrollNext, scrollTo],
    );

    const handleKeyDown = useCarouselKeyboardNavigation({ emblaApi, selectedIndex, slidesPerView, canScrollPrev, canScrollNext });

    return (
        <CarouselContext.Provider value={contextValue}>
            <div
                ref={rootRef}
                role="group"
                aria-roledescription="carousel"
                aria-label={label}
                tabIndex={-1}
                onKeyDown={handleKeyDown}
                className={clsx(styles.root, className)}
            >
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
    selectedClassName?: string;
}>;

export const CarouselSlide = ({ index, className, selectedClassName, children }: CarouselSlideProps) => {
    const { selectedIndex, slidesInView, slideCount } = useCarousel();
    const intl = useIntl();
    const isSelected = index === selectedIndex;

    return (
        <div
            role="group"
            aria-roledescription="slide"
            aria-label={intl.formatMessage(
                { id: "carousel.slide.ariaLabel", defaultMessage: "Slide {index} of {total}" },
                { index: index + 1, total: slideCount },
            )}
            inert={slidesInView !== null && !slidesInView.includes(index)}
            className={clsx(styles.slide, className, isSelected && selectedClassName)}
        >
            {children}
        </div>
    );
};

type CarouselButtonProps = Omit<ComponentProps<"button">, "disabled" | "onClick" | "ref" | "type">;

export const CarouselPreviousButton = ({ className, ...restProps }: CarouselButtonProps) => {
    const { previousButtonRef, hasNavigation, canScrollPrev, scrollPrev } = useCarousel();
    const intl = useIntl();

    if (!hasNavigation) {
        return null;
    }

    return (
        <button
            ref={previousButtonRef}
            type="button"
            disabled={!canScrollPrev}
            aria-label={intl.formatMessage({ id: "carousel.previousSlide.ariaLabel", defaultMessage: "Previous slide" })}
            onClick={scrollPrev}
            className={clsx(styles.button, className)}
            {...restProps}
        />
    );
};

export const CarouselNextButton = ({ className, ...restProps }: CarouselButtonProps) => {
    const { nextButtonRef, hasNavigation, canScrollNext, scrollNext } = useCarousel();
    const intl = useIntl();

    if (!hasNavigation) {
        return null;
    }

    return (
        <button
            ref={nextButtonRef}
            type="button"
            disabled={!canScrollNext}
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
    const { dotRefs, hasNavigation, snapCount, selectedIndex, scrollTo } = useCarousel();
    const intl = useIntl();

    if (!hasNavigation) {
        return null;
    }

    return (
        <div className={clsx(styles.dots, className)}>
            {Array.from({ length: snapCount }, (_, index) => {
                const isSelected = index === selectedIndex;

                return (
                    <button
                        key={index}
                        ref={(dot) => {
                            dotRefs.current[index] = dot;
                        }}
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

export const CarouselStatus = <T extends ElementType = "p">({ as, ...restProps }: CarouselStatusProps<T>) => {
    const { hasNavigation, selectedIndex, slidesInView, slideCount } = useCarousel();
    const Component = as || "p";

    if (!hasNavigation) {
        return null;
    }

    const first = slidesInView?.length ? Math.min(...slidesInView) : selectedIndex;
    const last = slidesInView?.length ? Math.max(...slidesInView) : selectedIndex;

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
