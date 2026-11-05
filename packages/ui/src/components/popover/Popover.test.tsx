import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Theme } from "../theme/Theme";
import { Popover } from "./Popover";

afterEach(cleanup);

describe("Popover", () => {
    it("renders the contract classes and the placement", async () => {
        render(
            <Theme colorScheme="dark" data-testid="theme">
                <Popover
                    open
                    onOpenChange={vi.fn()}
                    title="Time of day"
                    placement="top-end"
                    className="consumer-class"
                    trigger={<button type="button">Trigger</button>}
                >
                    <p>Content</p>
                </Popover>
            </Theme>,
        );

        const popover = await screen.findByRole("dialog", { name: "Time of day" });
        expect(popover.className).toContain("dextinityPopover");
        expect(popover.className).toContain("consumer-class");
        expect(popover.dataset.placement).toBe("top-end");
        expect(screen.getByTestId("theme").contains(popover)).toBe(true);
        expect(screen.getByText("Time of day").className).toContain("dextinityPopover__title");
    });
});
