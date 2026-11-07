import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Theme } from "../../theme/Theme";
import { Chip } from "../Chip";

/**
 * Compile-time contract for the clear button. Never rendered — it exists so
 * `tsc` fails if the typing regresses.
 */
export function ChipClearButtonTypeContract() {
    return (
        <>
            <Chip onClear={() => {}} clearLabel="Remove" slots={{ clearButton: "button" }}>
                Label
            </Chip>
            {/* @ts-expect-error the slot receives `type` and `disabled`, which a span does not accept */}
            <Chip onClear={() => {}} clearLabel="Remove" slots={{ clearButton: "span" }}>
                Label
            </Chip>
            {/* @ts-expect-error a clear button needs a `clearLabel` */}
            <Chip onClear={() => {}}>Label</Chip>
        </>
    );
}

afterEach(cleanup);

describe("Chip owner state", () => {
    it("emits the variant, color, size, and disabled state as data attributes, with their defaults when unset", () => {
        render(
            <>
                <Chip>Draft</Chip>
                <Chip variant="outlined" color="error" size="small" disabled>
                    Archived
                </Chip>
            </>,
        );

        const draft = screen.getByText("Draft");
        expect([draft.dataset.variant, draft.dataset.color, draft.dataset.size, draft.hasAttribute("data-disabled")]).toStrictEqual([
            "contained",
            "primary",
            "default",
            false,
        ]);
        const archived = screen.getByText("Archived");
        expect([archived.dataset.variant, archived.dataset.color, archived.dataset.size, archived.dataset.disabled]).toStrictEqual([
            "outlined",
            "error",
            "small",
            "",
        ]);
    });
});

describe("Chip slots", () => {
    it("keeps the clear handler and label when `slotProps` add props to the clear button", () => {
        const handleClear = vi.fn();
        render(
            <Theme>
                <Chip onClear={handleClear} clearLabel="Remove filter" slotProps={{ clearButton: { className: "consumer-class" } }}>
                    Published
                </Chip>
            </Theme>,
        );

        const clearButton = screen.getByRole("button", { name: "Remove filter" });
        fireEvent.click(clearButton);
        expect([
            clearButton.className.includes("consumer-class"),
            clearButton.className.includes("clearButton"),
            handleClear.mock.calls.length,
        ]).toStrictEqual([true, true, 1]);
    });
});

describe("Chip as an interactive element", () => {
    it("ignores clicks and marks itself as disabled when it renders as a button", () => {
        const handleClick = vi.fn();
        render(
            <Chip render={<button type="button" />} disabled onClick={handleClick}>
                Published
            </Chip>,
        );

        const chip = screen.getByRole("button", { name: "Published" });
        fireEvent.click(chip);
        expect([handleClick.mock.calls.length, chip.getAttribute("aria-disabled")]).toStrictEqual([0, "true"]);
    });
});
