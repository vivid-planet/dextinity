import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Icon } from "../Icon";

describe("Icon", () => {
    it("is hidden from assistive technology without a label", () => {
        const { container } = render(<Icon name="star-fill" />);

        expect(container.querySelector("span")?.getAttribute("aria-hidden")).toBe("true");
    });

    it("is an image named by its label", () => {
        const { container } = render(<Icon name="star-fill" aria-label="Favorite" />);

        expect(within(container).getByRole("img", { name: "Favorite" })).toBeInTheDocument();
    });

    it("is an image named by the element its aria-labelledby refers to", () => {
        const { container } = render(
            <>
                <span id="favorite-label">Favorite</span>
                <Icon name="star-fill" aria-labelledby="favorite-label" />
            </>,
        );

        expect(within(container).getByRole("img", { name: "Favorite" })).toBeInTheDocument();
    });

    it("keeps its contract class next to the consumer's class", () => {
        const { container } = render(<Icon name="star-fill" className="consumer-class" />);

        expect(container.querySelector("span")?.getAttribute("class")).toBe("dextinityIcon consumer-class");
    });

    it("reads its glyph from the icon's CSS variable, so a theme can replace it", () => {
        const { container } = render(<Icon name="search" />);
        const icon = container.querySelector("span");

        expect(icon?.style.getPropertyValue("--dextinity-current-icon-mask")).toBe("var(--dextinity-icon-search)");
        expect(icon?.style.getPropertyValue("--dextinity-current-icon-image")).toBe("var(--dextinity-colored-icon-search)");
    });

    it("reads the image of a colored icon from the icon's colored variable", () => {
        const { container } = render(<Icon name="dextinity-color" />);
        const icon = container.querySelector("span");

        expect(icon?.style.getPropertyValue("--dextinity-current-icon-image")).toBe("var(--dextinity-colored-icon-dextinity-color)");
    });

    it("emits its size as a data attribute", () => {
        const { container } = render(<Icon name="clock" size="large" />);

        expect(container.querySelector("span")).toHaveAttribute("data-size", "large");
    });

    it("shows the icon that a deprecated earlier name points to", () => {
        const { container } = render(<Icon name="delete" />);
        const icon = container.querySelector("span");

        expect(icon?.style.getPropertyValue("--dextinity-current-icon-mask")).toBe("var(--dextinity-icon-trash)");
        expect(icon?.style.getPropertyValue("--dextinity-current-icon-image")).toBe("var(--dextinity-colored-icon-trash)");
    });
});
