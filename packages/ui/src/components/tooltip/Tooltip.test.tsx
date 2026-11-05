import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Theme } from "../theme/Theme";
import { Tooltip } from "./Tooltip";

afterEach(cleanup);

describe("Tooltip", () => {
    it("renders the popup with the contract classes and the preferred placement", async () => {
        render(
            <Tooltip content="More actions" shortcut="⌘." placement="top" open className="consumer-class">
                <button type="button">Trigger</button>
            </Tooltip>,
        );

        const tooltip = await screen.findByText("More actions");
        expect(tooltip.className).toContain("dextinityTooltip");
        expect(tooltip.className).toContain("consumer-class");
        expect(tooltip.dataset.placement).toBe("top");
        expect(screen.getByText("⌘.").className).toContain("dextinityTooltip__shortcut");
    });

    it("portals the popup into the closest theme, so it keeps the theme's color scheme", async () => {
        render(
            <Theme colorScheme="dark" data-testid="theme">
                <Tooltip content="More actions" open>
                    <button type="button">Trigger</button>
                </Tooltip>
            </Theme>,
        );

        expect(screen.getByTestId("theme").contains(await screen.findByText("More actions"))).toBe(true);
    });
});
