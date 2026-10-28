import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./Button";

/**
 * Compile-time contract for slot-prop typing. Never rendered — it exists so
 * `tsc` fails if the typing regresses.
 */
export function ButtonSlotPropsTypeContract() {
    const icon = <span />;
    return (
        <>
            {/* The chosen element flows into slotProps: an anchor slot accepts `href`, no cast. */}
            <Button slots={{ startIcon: "a" }} slotProps={{ startIcon: { href: "/x" } }} startIcon={icon} />
            {/* Two slots infer their elements independently from one `slots` literal. */}
            <Button
                slots={{ startIcon: "a", endIcon: "button" }}
                slotProps={{ startIcon: { href: "/x" }, endIcon: { type: "submit" } }}
                startIcon={icon}
                endIcon={icon}
            />
            <Button
                slots={{ startIcon: "a" }}
                slotProps={{
                    // @ts-expect-error an anchor slot's href must be a string
                    startIcon: { href: 123 },
                }}
                startIcon={icon}
            />
            <Button
                slotProps={{
                    // @ts-expect-error the default span slot has no href
                    startIcon: { href: "/x" },
                }}
                startIcon={icon}
            />
        </>
    );
}

describe("Button slots", () => {
    it("renders a slot as the element chosen in `slots`, merging the contract class with consumer props", () => {
        render(
            <Button slots={{ startIcon: "a" }} slotProps={{ startIcon: { href: "/downloads", className: "consumer-class" } }} startIcon={<span />}>
                Download
            </Button>,
        );

        const startIcon = screen.getByRole("link");
        expect(startIcon.getAttribute("href")).toBe("/downloads");
        expect(startIcon.className).toContain("consumer-class");
        expect(startIcon.className).toContain("startIcon");
    });
});
