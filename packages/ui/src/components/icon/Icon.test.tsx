import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Icon } from "./Icon";

describe("Icon", () => {
    it("is hidden from assistive technology without a label", () => {
        const { container } = render(<Icon name="favorite" />);

        expect(container.querySelector("span")?.getAttribute("aria-hidden")).toBe("true");
    });

    it("is an image named by its label", () => {
        const { container } = render(<Icon name="favorite" aria-label="Favorite" />);

        expect(within(container).getByRole("img", { name: "Favorite" })).toBeInTheDocument();
    });

    it("is an image named by the element its aria-labelledby refers to", () => {
        const { container } = render(
            <>
                <span id="favorite-label">Favorite</span>
                <Icon name="favorite" aria-labelledby="favorite-label" />
            </>,
        );

        expect(within(container).getByRole("img", { name: "Favorite" })).toBeInTheDocument();
    });

    it("keeps its contract class next to the consumer's class", () => {
        const { container } = render(<Icon name="favorite" className="consumer-class" />);

        expect(container.querySelector("span")?.getAttribute("class")).toBe("dextinityIcon consumer-class");
    });

    it("reads its glyph from the icon's CSS variable, so a theme can replace it", () => {
        const { container } = render(<Icon name="search" />);
        const icon = container.querySelector("span");

        expect(icon?.style.getPropertyValue("--dextinity-current-icon-mask")).toBe("var(--dextinity-icon-search)");
        expect(icon?.style.getPropertyValue("--dextinity-current-icon-image")).toBe("var(--dextinity-colored-icon-search)");
    });

    it("emits its size as a data attribute", () => {
        const { container } = render(<Icon name="time" size="large" />);

        expect(container.querySelector("span")).toHaveAttribute("data-size", "large");
    });

    it("reads the soft fill of a duotone icon from the icon's duotone variable", () => {
        const { container } = render(<Icon name="time" duotone />);
        const icon = container.querySelector("span");

        expect(icon).toHaveAttribute("data-duotone");
        expect(icon?.style.getPropertyValue("--dextinity-current-duotone-icon-mask")).toBe("var(--dextinity-duotone-icon-time)");
    });

    it("has no soft fill without duotone", () => {
        const { container } = render(<Icon name="time" />);
        const icon = container.querySelector("span");

        expect(icon).not.toHaveAttribute("data-duotone");
        expect(icon?.style.getPropertyValue("--dextinity-current-duotone-icon-mask")).toBe("");
    });
});
