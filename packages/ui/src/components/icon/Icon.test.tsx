import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Theme } from "../theme/Theme";
import { defaultIcons } from "./defaultIcons";
import { Icon } from "./Icon";

/**
 * Compile-time contract for the `icons` of `Theme`. Never rendered — it exists so `tsc` fails if the typing regresses.
 */
export function ThemeIconsTypeContract() {
    return (
        <>
            <Theme icons={{ ...defaultIcons, favorite: "/project/favorite.svg#icon" }} />
            {/* @ts-expect-error without the spread, every icon needs a URL, so listing only some icons is an error */}
            <Theme icons={{ favorite: "/project/favorite.svg#icon" }} />
        </>
    );
}

describe("Icon", () => {
    it("keeps the icons of the outer Theme inside a nested Theme without icons", () => {
        const { container } = render(
            <Theme icons={{ ...defaultIcons, favorite: "/project/favorite.svg#icon" }}>
                <Theme colorScheme="dark">
                    <Icon icon="favorite" />
                </Theme>
            </Theme>,
        );

        expect(container.querySelector("use")?.getAttribute("href")).toBe("/project/favorite.svg#icon");
    });

    it("is hidden from assistive technology without a label", () => {
        const { container } = render(
            <Theme>
                <Icon icon="favorite" />
            </Theme>,
        );

        expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    });

    it("is an image named by its label", () => {
        const { container } = render(
            <Theme>
                <Icon icon="favorite" aria-label="Favorite" />
            </Theme>,
        );

        expect(within(container).getByRole("img", { name: "Favorite" })).toBeInTheDocument();
    });

    it("is an image named by the element its aria-labelledby refers to", () => {
        const { container } = render(
            <Theme>
                <span id="favorite-label">Favorite</span>
                <Icon icon="favorite" aria-labelledby="favorite-label" />
            </Theme>,
        );

        expect(within(container).getByRole("img", { name: "Favorite" })).toBeInTheDocument();
    });

    it("keeps its contract class next to the consumer's class", () => {
        const { container } = render(
            <Theme>
                <Icon icon="favorite" className="consumer-class" />
            </Theme>,
        );

        expect(container.querySelector("svg")?.getAttribute("class")).toBe("dextinityIcon consumer-class");
    });
});
