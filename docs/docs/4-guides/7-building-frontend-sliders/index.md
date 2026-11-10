---
title: Building frontend sliders
---

This guide explains how to build sliders (also called carousels) in the site with [Embla Carousel](https://www.embla-carousel.com/) or [Swiper](https://swiperjs.com/), and what you have to take care of for accessibility.

## Embla or Swiper?

A project should use only one slider library.
Decide which one at the start of the project, based on the sliders in the design.

We use Embla by default. It's lightweight, comes without styles, and is sufficient for most sliders.
The [Starter](https://github.com/vivid-planet/dextinity-starter) and the Demo use Embla.

Swiper isn't part of the Starter. Use it instead of Embla only if the project needs features that would take a lot of effort to build with Embla, for example:

- An effect that Embla doesn't offer, for example cube, coverflow or cards
- Zooming into images inside the slider with pinch or double tap, for example in a product gallery
- A scrollbar that users can drag

If only a single slider needs such a feature, build it with Embla if the effort is reasonable, instead of adding Swiper to the project for this one slider.

### Sliders with special requirements

When a slider needs a feature that the project doesn't have yet, check whether the project's library already covers it, for example with a plugin, a module or an example in its documentation, such as the [thumbnails example](https://www.embla-carousel.com/docs/examples/predefined#thumbnails) of Embla.
Only build the feature yourself if the library doesn't cover it.

## Embla

### The `Carousel` component

New projects are based on the Starter, which contains a `Carousel` component in `site/src/common/components/carousel/`.
It wraps Embla and its accessibility plugin, and adds what the plugin is missing:

```tsx
<Carousel
    label={intl.formatMessage({
        id: "mediaGalleryBlock.ariaLabel",
        defaultMessage: "Media gallery",
    })}
    slideCount={data.items.blocks.length}
>
    <CarouselPreviousButton className={styles.previousButton} />
    <CarouselViewport>
        {data.items.blocks.map((block) => (
            <CarouselSlide key={block.key}>{/* … */}</CarouselSlide>
        ))}
    </CarouselViewport>
    <CarouselStatus />
    <CarouselNextButton className={styles.nextButton} />
</Carousel>
```

For examples, see `MediaGalleryBlock` (`site/src/common/blocks/`) and `SliderBlock` (`site/src/documents/pages/blocks/`) in the Starter. `SliderBlock` also uses dots (`CarouselDots`).
The Demo contains the same component and blocks.

Use this one component for all sliders in the project instead of setting up Embla in every block.
Accessibility, keyboard navigation and the controls depend on it, so they are built and tested once.

### Plugins

The Starter already includes Embla 9 with the accessibility and auto height plugins.

Further features are available as plugins, for example `embla-carousel-autoplay` and `embla-carousel-fade`.
Install them in the same version as the other Embla packages:

```bash
npm install embla-carousel-autoplay@<version of embla-carousel>
```

Embla plugins cover accessibility only partly.
When you add a plugin, check that the slider still meets our [accessibility guidelines](../../9-coding-guidelines/14-accessibility.md), and add what the plugin is missing.
For example, autoplay needs a visible button to pause and resume it ([WCAG 2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)) and must not start for users who prefer reduced motion.
Test the slider with the keyboard only and with a screen reader afterwards (see [Testing](#testing)).

### Things to keep in mind

- Style disabled buttons with `[aria-disabled="true"]` and visible slides with `:not([aria-hidden="true"])`. The accessibility plugin sets these attributes, not `disabled` or a class.
- With `align: "center"`, Embla calculates the offset of the first slide on the client, so the slides jump sideways after loading. When you use it, apply the same offset in CSS, so the layout rendered by the server already matches.

## Swiper

### Installation

Swiper isn't included in the Starter by default. Install and set it up in the project yourself:

```bash
npm install swiper
```

Import the CSS of Swiper and of every module you use, and override the `.swiper-*` classes to match the design.

### Accessibility

Swiper's accessibility isn't complete out of the box. Wrap Swiper in one shared component that sets up the following, and use it for all Swiper sliders in the project:

- **`A11y` module:** Enable it and pass translated messages:

    ```tsx
    import "swiper/css";
    import "swiper/css/a11y";

    import { useIntl } from "react-intl";
    import { A11y } from "swiper/modules";
    import { Swiper, type SwiperProps } from "swiper/react";

    export const BasicSwiper = ({ children, modules = [], ...restProps }: SwiperProps) => {
        const intl = useIntl();

        return (
            <Swiper
                a11y={{
                    prevSlideMessage: intl.formatMessage({
                        id: "swiper.prevButton.ariaLabel",
                        defaultMessage: "Previous slide",
                    }),
                    nextSlideMessage: intl.formatMessage({
                        id: "swiper.nextButton.ariaLabel",
                        defaultMessage: "Next slide",
                    }),
                    firstSlideMessage: intl.formatMessage({
                        id: "swiper.firstSlide",
                        defaultMessage: "This is the first slide",
                    }),
                    lastSlideMessage: intl.formatMessage({
                        id: "swiper.lastSlide",
                        defaultMessage: "This is the last slide",
                    }),
                    paginationBulletMessage: intl.formatMessage(
                        {
                            id: "swiper.paginationBullet.ariaLabel",
                            defaultMessage: "Go to slide {index}",
                        },
                        // Swiper replaces {{index}} with the index of the slide.
                        { index: "{{index}}" },
                    ),
                }}
                modules={[...modules, A11y]}
                {...restProps}
            >
                {children}
            </Swiper>
        );
    };
    ```

- **Arrow keys:** The `Keyboard` module reacts to the arrow keys anywhere on the page, so all carousels in view move at once. Handle the arrow keys on the element of each carousel instead and call `swiper.slidePrev()` and `swiper.slideNext()`, like `useArrowKeyNavigation` of the Embla `Carousel` component.
- **Hidden slides:** Swiper doesn't make hidden slides unfocusable. Set `inert` on all slides that aren't visible, and update it on `slideChange`.
- **Reduced motion:** Set `speed` to `0` for users who prefer reduced motion, and don't start the `Autoplay` module for them.

## Testing

Test every slider, with Embla and with Swiper:

- [ ] Navigate with the keyboard only: all slides are reachable, the arrow keys only move the carousel that has the focus, and the focus never gets lost or ends up in a hidden slide.
- [ ] Use a screen reader, for example VoiceOver: it doesn't read slides that aren't visible, and all labels are translated.
- [ ] Check with one slide, with exactly as many slides as fit into the viewport, and with many slides: the controls are hidden when all slides fit.
- [ ] Reload the page: the slider doesn't jump, also with centered slides.
- [ ] Enable reduced motion in the operating system: there are no animations, and autoplay doesn't start.
- [ ] Automated tools such as Stark or axe often report wrong contrast errors for text on images. Check these manually.
