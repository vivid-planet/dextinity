import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { IconButton } from "./IconButton";

/**
 * Compile-time contract for slot-prop typing. Never rendered — it exists so
 * `tsc` fails if the typing regresses.
 */
export function IconButtonSlotPropsTypeContract() {
    return (
        <>
            {/* The chosen element flows into slotProps: an anchor slot accepts `href`, no cast. */}
            <IconButton aria-label="Download" slots={{ icon: "a" }} slotProps={{ icon: { href: "/x" } }} />
            <IconButton
                aria-label="Download"
                slots={{ icon: "a" }}
                slotProps={{
                    // @ts-expect-error an anchor slot's href must be a string
                    icon: { href: 123 },
                }}
            />
            <IconButton
                aria-label="Download"
                slotProps={{
                    // @ts-expect-error the default span slot has no href
                    icon: { href: "/x" },
                }}
            />
        </>
    );
}

afterEach(cleanup);

describe("IconButton owner state", () => {
    it("emits the variant, color, and size as data attributes, with their defaults when unset", () => {
        render(
            <>
                <IconButton aria-label="Favorite">
                    <span />
                </IconButton>
                <IconButton aria-label="Remove" variant="outlined" color="error" size="small">
                    <span />
                </IconButton>
            </>,
        );

        const favorite = screen.getByRole("button", { name: "Favorite" });
        expect([favorite.dataset.variant, favorite.dataset.color, favorite.dataset.size]).toStrictEqual(["contained", "primary", "default"]);
        const remove = screen.getByRole("button", { name: "Remove" });
        expect([remove.dataset.variant, remove.dataset.color, remove.dataset.size]).toStrictEqual(["outlined", "error", "small"]);
    });

    it("marks the button as busy only while loading", () => {
        render(
            <>
                <IconButton aria-label="Save">
                    <span />
                </IconButton>
                <IconButton aria-label="Saving" loading>
                    <span />
                </IconButton>
            </>,
        );

        const save = screen.getByRole("button", { name: "Save" });
        expect([save.hasAttribute("data-loading"), save.getAttribute("aria-busy")]).toStrictEqual([false, null]);
        const saving = screen.getByRole("button", { name: "Saving" });
        expect([saving.dataset.loading, saving.getAttribute("aria-busy")]).toStrictEqual(["", "true"]);
    });
});

describe("IconButton slots", () => {
    it("renders a slot as the element chosen in `slots`, merging the contract class with consumer props", () => {
        render(
            <IconButton aria-label="Download" slots={{ icon: "a" }} slotProps={{ icon: { href: "/downloads", className: "consumer-class" } }}>
                <span />
            </IconButton>,
        );

        const icon = screen.getByRole("link");
        expect([icon.getAttribute("href"), icon.className.includes("consumer-class"), icon.className.includes("icon")]).toStrictEqual([
            "/downloads",
            true,
            true,
        ]);
    });
});

describe("IconButton", () => {
    it("replaces the icon with a spinner while loading", () => {
        const { container } = render(
            <IconButton aria-label="Refresh" loading>
                <span data-testid="icon" />
            </IconButton>,
        );

        expect(screen.queryByTestId("icon")).toBeNull();
        expect(container.querySelector(".dextinityIconButton__loadingSpinner")).not.toBeNull();
    });

    it("forwards the ref to the button", () => {
        const ref = createRef<HTMLButtonElement>();
        render(
            <IconButton aria-label="More actions" ref={ref}>
                <span />
            </IconButton>,
        );

        expect(ref.current).toBe(screen.getByRole("button", { name: "More actions" }));
    });
});
