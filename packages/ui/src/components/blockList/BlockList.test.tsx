import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Block } from "./Block";
import { BlockList } from "./BlockList";

afterEach(cleanup);

describe("BlockList", () => {
    it("emits whether blocks can be moved and added as data attributes", () => {
        const { container } = render(
            <>
                <BlockList aria-label="Static" />
                <BlockList aria-label="Editable" onReorder={vi.fn()} onAdd={vi.fn()} />
            </>,
        );
        const [plain, editable] = Array.from(container.children) as HTMLElement[];

        expect(plain.className).toContain("dextinityBlockList");
        expect([plain.hasAttribute("data-reorderable"), plain.hasAttribute("data-addable")]).toStrictEqual([false, false]);
        expect([editable.dataset.reorderable, editable.dataset.addable]).toStrictEqual(["", ""]);
    });
});

describe("Block", () => {
    it("emits visibility, selection, and expansion as data attributes", () => {
        const { container } = render(
            <BlockList aria-label="Blocks">
                <Block title="Hero" visible />
                <Block title="Form" visible={false} selected expanded onExpandedChange={vi.fn()} />
            </BlockList>,
        );
        const [hero, form] = Array.from(container.querySelectorAll<HTMLElement>(".dextinityBlock"));

        expect(["visible", "selected", "expanded", "expandable"].map((key) => hero.hasAttribute(`data-${key}`))).toStrictEqual([
            true,
            false,
            false,
            false,
        ]);
        expect(["visible", "selected", "expanded", "expandable"].map((key) => form.hasAttribute(`data-${key}`))).toStrictEqual([
            false,
            true,
            true,
            true,
        ]);
    });

    it("describes each grip by its block's title", () => {
        render(
            <BlockList aria-label="Blocks" onReorder={vi.fn()}>
                <Block title="Hero" visible />
                <Block title="Form" visible />
            </BlockList>,
        );

        const descriptions = screen
            .getAllByRole("button", { name: "Move" })
            .map((grip) => document.getElementById(grip.getAttribute("aria-describedby") ?? "")?.textContent);
        expect(descriptions).toStrictEqual(["Hero", "Form"]);
    });
});
