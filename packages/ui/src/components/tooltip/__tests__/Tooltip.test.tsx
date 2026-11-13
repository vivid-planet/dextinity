import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Theme } from "../../theme/Theme";
import { Tooltip } from "../Tooltip";

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

    it("keeps the tooltip open on a click of the trigger with closeOnClick off", async () => {
        const onOpenChange = vi.fn();
        render(
            <Tooltip content="More actions" open closeOnClick={false} onOpenChange={onOpenChange}>
                <button type="button">Trigger</button>
            </Tooltip>,
        );
        await screen.findByText("More actions");

        fireEvent.pointerDown(screen.getByRole("button"));
        fireEvent.click(screen.getByRole("button"));

        expect(onOpenChange).not.toHaveBeenCalledWith(false, expect.anything());
    });

    it("closes the tooltip on a click of the trigger by default, with the reason", async () => {
        const onOpenChange = vi.fn();
        render(
            <Tooltip content="More actions" open onOpenChange={onOpenChange}>
                <button type="button">Trigger</button>
            </Tooltip>,
        );
        await screen.findByText("More actions");

        fireEvent.pointerDown(screen.getByRole("button"));
        fireEvent.click(screen.getByRole("button"));

        expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "trigger-press" });
    });

    it("renders formatted content", async () => {
        render(
            <Tooltip
                content={
                    <>
                        The <strong>slug</strong> is part of the URL.
                    </>
                }
                open
            >
                <button type="button">Trigger</button>
            </Tooltip>,
        );

        expect((await screen.findByText("slug")).tagName).toBe("STRONG");
    });
});
