import type { EmblaCarouselType, OptionsHandlerType } from "embla-carousel";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CarouselAccessibility } from "./CarouselAccessibility";

const optionsHandler = {
    mergeOptions: (optionsA: object, optionsB: object) => ({ ...optionsA, ...optionsB }),
    optionsAtMedia: (options: object) => options,
} as unknown as OptionsHandlerType;

// Four slides of 100px in a viewport of 200px, so two slides are in view.
const createCarousel = ({ rootTabIndex }: { rootTabIndex?: number } = {}) => {
    const root = document.createElement("div");
    if (rootTabIndex !== undefined) {
        root.tabIndex = rootTabIndex;
    }
    const viewport = document.createElement("div");
    Object.defineProperty(viewport, "clientWidth", { value: 200 });
    const container = document.createElement("div");
    const buttons = Array.from({ length: 4 }, () => document.createElement("button"));
    const slides = buttons.map((button, index) => {
        const slide = document.createElement("div");
        Object.defineProperties(slide, { offsetLeft: { value: index * 100 }, offsetWidth: { value: 100 } });
        slide.appendChild(button);
        container.appendChild(slide);
        return slide;
    });
    viewport.appendChild(container);
    root.appendChild(viewport);
    document.body.appendChild(root);

    const snaps = [0, 0.5, 1];
    const listeners = new Set<() => void>();
    let selectedSnap = 0;
    const select = (snapIndex: number) => {
        selectedSnap = Math.min(Math.max(snapIndex, 0), snaps.length - 1);
        for (const listener of listeners) {
            listener();
        }
    };

    const emblaApi = {
        rootNode: () => viewport,
        slideNodes: () => slides,
        scrollSnapList: () => snaps,
        selectedScrollSnap: () => selectedSnap,
        scrollPrev: vi.fn(() => select(selectedSnap - 1)),
        scrollNext: vi.fn(() => select(selectedSnap + 1)),
        on: (_event: string, listener: () => void) => {
            listeners.add(listener);
            return emblaApi;
        },
        off: (_event: string, listener: () => void) => {
            listeners.delete(listener);
            return emblaApi;
        },
    } as unknown as EmblaCarouselType;

    const plugin = CarouselAccessibility({ rootNode: () => root });
    plugin.init(emblaApi, optionsHandler);

    return { root, viewport, slides, buttons, emblaApi, plugin };
};

const pressKey = (target: Element, key: string, modifiers: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...modifiers });
    target.dispatchEvent(event);
    return event;
};

const getInertSlides = (slides: HTMLElement[]) => slides.flatMap((slide, index) => (slide.inert ? [index] : []));

describe("CarouselAccessibility", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("makes the slides out of view inert", () => {
        const { slides, root } = createCarousel();

        expect(getInertSlides(slides)).toEqual([2, 3]);

        pressKey(root, "ArrowRight");

        expect(getInertSlides(slides)).toEqual([0, 3]);
    });

    it("scrolls to the next and previous snap with the arrow keys", () => {
        const { root, emblaApi } = createCarousel();

        pressKey(root, "ArrowRight");
        pressKey(root, "ArrowLeft");

        expect(emblaApi.scrollNext).toHaveBeenCalledOnce();
        expect(emblaApi.scrollPrev).toHaveBeenCalledOnce();
    });

    it("ignores other keys", () => {
        const { root, emblaApi } = createCarousel();

        const event = pressKey(root, "ArrowDown");

        expect(event.defaultPrevented).toBe(false);
        expect(emblaApi.scrollNext).not.toHaveBeenCalled();
    });

    it.each(["altKey", "ctrlKey", "metaKey", "shiftKey"])("ignores the arrow keys with the %s modifier", (modifier) => {
        const { root, emblaApi } = createCarousel();

        const event = pressKey(root, "ArrowLeft", { [modifier]: true });

        expect(event.defaultPrevented).toBe(false);
        expect(emblaApi.scrollPrev).not.toHaveBeenCalled();
    });

    it("leaves the arrow keys to elements that use them", () => {
        const { slides, emblaApi } = createCarousel();
        const input = document.createElement("input");
        slides[0].appendChild(input);

        const event = pressKey(input, "ArrowRight");

        expect(event.defaultPrevented).toBe(false);
        expect(emblaApi.scrollNext).not.toHaveBeenCalled();
    });

    it("ignores keys that a nested carousel has already handled", () => {
        const { slides, emblaApi } = createCarousel();
        const nestedCarousel = document.createElement("div");
        nestedCarousel.addEventListener("keydown", (event) => event.preventDefault());
        slides[0].appendChild(nestedCarousel);

        pressKey(nestedCarousel, "ArrowRight");

        expect(emblaApi.scrollNext).not.toHaveBeenCalled();
    });

    it("moves the focus to the root when the focused slide scrolls out of view", () => {
        const { root, buttons } = createCarousel();
        buttons[0].focus();

        pressKey(buttons[0], "ArrowRight");

        expect(document.activeElement).toBe(root);
    });

    it("keeps the focus in a slide that stays in view", () => {
        const { buttons } = createCarousel();
        buttons[1].focus();

        pressKey(buttons[1], "ArrowRight");

        expect(document.activeElement).toBe(buttons[1]);
    });

    it("moves the focus to the root when the focused element is removed", async () => {
        const { root } = createCarousel();
        const dot = document.createElement("button");
        root.appendChild(dot);
        dot.focus();

        dot.remove();
        await Promise.resolve();

        expect(document.activeElement).toBe(root);
    });

    it("makes the root focusable", () => {
        const { root } = createCarousel();

        expect(root.getAttribute("tabindex")).toBe("-1");
    });

    it("keeps the tab index of the root", () => {
        const { root } = createCarousel({ rootTabIndex: 0 });

        expect(root.getAttribute("tabindex")).toBe("0");
    });

    it("undoes native scrolling of the viewport", () => {
        const { viewport } = createCarousel();
        viewport.scrollLeft = 100;

        viewport.dispatchEvent(new Event("scroll"));

        expect(viewport.scrollLeft).toBe(0);
    });

    it("removes the inert state and the listeners when it is destroyed", () => {
        const { root, slides, emblaApi, plugin } = createCarousel();

        plugin.destroy();
        pressKey(root, "ArrowRight");

        expect(getInertSlides(slides)).toEqual([]);
        expect(emblaApi.scrollNext).not.toHaveBeenCalled();
    });
});
