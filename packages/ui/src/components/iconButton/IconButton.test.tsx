import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { IconButton } from "./IconButton";

afterEach(cleanup);

describe("IconButton", () => {
    it("emits the variant and size as data attributes, with their defaults when unset", () => {
        render(
            <>
                <IconButton aria-label="More actions">
                    <span />
                </IconButton>
                <IconButton aria-label="Delete" variant="outlined" size="small">
                    <span />
                </IconButton>
            </>,
        );

        const more = screen.getByRole("button", { name: "More actions" });
        expect([more.className.includes("dextinityIconButton"), more.dataset.variant, more.dataset.size]).toStrictEqual([true, "text", "default"]);
        const remove = screen.getByRole("button", { name: "Delete" });
        expect([remove.dataset.variant, remove.dataset.size]).toStrictEqual(["outlined", "small"]);
    });

    it("replaces the icon with a spinner and marks the button as busy while loading", () => {
        render(
            <IconButton aria-label="Refresh" loading>
                <span data-testid="icon" />
            </IconButton>,
        );

        const refresh = screen.getByRole("button", { name: "Refresh" });
        expect([refresh.dataset.loading, refresh.getAttribute("aria-busy")]).toStrictEqual(["", "true"]);
        expect(screen.queryByTestId("icon")).toBeNull();
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
