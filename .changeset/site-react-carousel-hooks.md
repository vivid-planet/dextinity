---
"@dextinity/site-react": minor
"@dextinity/site-nextjs": minor
---

Add the `CarouselAccessibility` Embla plugin and the `useCarouselState` hook for accessible carousels based on Embla Carousel

The project sets up Embla with `useEmblaCarousel` and can use all of Embla's options and plugins. Markup and styling stay in the project.

- `CarouselAccessibility` makes the slides that aren't fully in view inert and scrolls with the arrow keys, unless an input or a nested carousel uses them. It keeps the focus in the carousel when the focused element scrolls out of view or is removed, and undoes native scrolling of the viewport, for example by screen readers. It doesn't support `loop`, `axis: "y"` and `direction: "rtl"`.
- `useCarouselState` provides the selected snap, the slides in view and whether the carousel can scroll for rendering the buttons, dots and status.

`embla-carousel` is an optional peer dependency. Install `embla-carousel` and `embla-carousel-react` in the project to use the carousel.

**Example**

```tsx
const getCarouselRoot = (viewport: HTMLElement) => viewport.closest<HTMLElement>('[aria-roledescription="carousel"]');
const options = { align: "start", watchFocus: false } as const;

const Carousel = ({ label, slideCount, children }: CarouselProps) => {
    const plugins = useMemo(() => [CarouselAccessibility({ rootNode: getCarouselRoot })], []);
    const [viewportRef, emblaApi] = useEmblaCarousel(options, plugins);
    const { canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useCarouselState({ emblaApi, slideCount });

    return (
        <div role="group" aria-roledescription="carousel" aria-label={label}>
            <button type="button" aria-disabled={!canScrollPrev} onClick={scrollPrev} aria-label="Previous slide" />
            <div ref={viewportRef} className={styles.viewport}>
                <div className={styles.container}>
                    {Children.map(children, (child) => (
                        <div role="group" aria-roledescription="slide">
                            {child}
                        </div>
                    ))}
                </div>
            </div>
            <button type="button" aria-disabled={!canScrollNext} onClick={scrollNext} aria-label="Next slide" />
        </div>
    );
};
```
