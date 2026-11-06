import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Toolbar } from "./Toolbar";
import { ToolbarButton } from "./ToolbarButton";
import { ToolbarGroup } from "./ToolbarGroup";
import { ToolbarMenu } from "./ToolbarMenu";
import { ToolbarSeparator } from "./ToolbarSeparator";

afterEach(cleanup);

describe("Toolbar", () => {
    it("emits the class contract of the toolbar and its parts", () => {
        render(
            <Toolbar aria-label="Formatting" data-testid="toolbar">
                <ToolbarGroup aria-label="Text style">
                    <ToolbarButton aria-label="Bold" onClick={vi.fn()}>
                        B
                    </ToolbarButton>
                </ToolbarGroup>
                <ToolbarSeparator data-testid="separator" />
                <ToolbarMenu label="Paragraph" open={false} onOpenChange={vi.fn()} data-testid="menu">
                    {null}
                </ToolbarMenu>
            </Toolbar>,
        );

        const toolbar = screen.getByRole("toolbar", { name: "Formatting" });
        expect(toolbar.className).toContain("dextinityToolbar");
        expect(toolbar.dataset.orientation).toBe("horizontal");
        expect(screen.getByRole("group", { name: "Text style" }).className).toContain("dextinityToolbarGroup");
        expect(screen.getByRole("button", { name: "Bold" }).className).toMatch(
            /dextinityIconButton.*dextinityToolbarButton|dextinityToolbarButton.*dextinityIconButton/,
        );
        expect(screen.getByTestId("separator").className).toContain("dextinityToolbarSeparator");
        expect(screen.getByRole("button", { name: "Paragraph" }).className).toContain("dextinityToolbarMenu");
        expect(screen.getByTestId("menu")).toBe(screen.getByRole("button", { name: "Paragraph" }));
    });
});

describe("ToolbarButton", () => {
    it("is a toggle only with `pressed`", () => {
        render(
            <Toolbar aria-label="Formatting">
                <ToolbarButton aria-label="Bold" pressed>
                    B
                </ToolbarButton>
                <ToolbarButton aria-label="Italic" pressed={false}>
                    I
                </ToolbarButton>
                <ToolbarButton aria-label="Undo">U</ToolbarButton>
            </Toolbar>,
        );

        const bold = screen.getByRole("button", { name: "Bold" });
        const italic = screen.getByRole("button", { name: "Italic" });
        const undo = screen.getByRole("button", { name: "Undo" });
        expect([bold.getAttribute("aria-pressed"), bold.hasAttribute("data-pressed"), bold.hasAttribute("data-toggle")]).toStrictEqual([
            "true",
            true,
            true,
        ]);
        expect([italic.getAttribute("aria-pressed"), italic.hasAttribute("data-pressed")]).toStrictEqual(["false", false]);
        expect([undo.hasAttribute("aria-pressed"), undo.hasAttribute("data-toggle")]).toStrictEqual([false, false]);
    });
});
