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
});
