import { cleanup, render, screen } from "@testing-library/react";
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
    it("emits the variant and the size as data attributes, with their defaults when unset", () => {
        render(
            <>
                <IconButton aria-label="Favorite">
                    <span />
                </IconButton>
                <IconButton aria-label="Remove" variant="danger" size="small">
                    <span />
                </IconButton>
            </>,
        );

        const favorite = screen.getByRole("button", { name: "Favorite" });
        expect([favorite.dataset.variant, favorite.dataset.size]).toStrictEqual(["ghost", "default"]);
        const remove = screen.getByRole("button", { name: "Remove" });
        expect([remove.dataset.variant, remove.dataset.size]).toStrictEqual(["danger", "small"]);
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
