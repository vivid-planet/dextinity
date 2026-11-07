import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Block } from "../Block";
import { BlockList } from "../BlockList";
import { BlockListHeader } from "../BlockListHeader";

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

    it("offers inserting before the first block, between blocks, and at the end", () => {
        const onAdd = vi.fn();
        render(
            <BlockList aria-label="Blocks" onAdd={onAdd}>
                <Block title="Hero" visible />
                <Block title="Form" visible />
            </BlockList>,
        );

        screen.getAllByRole("button", { name: "Insert block here" }).forEach((button) => fireEvent.click(button));
        fireEvent.click(screen.getByRole("button", { name: "Add block" }));

        expect(onAdd.mock.calls).toStrictEqual([[0], [1], [2]]);
    });

    it("offers only the add button without blocks", () => {
        render(<BlockList aria-label="Blocks" onAdd={vi.fn()} />);

        expect(screen.queryByRole("button", { name: "Insert block here" })).toBeNull();
        expect(screen.getByRole("button", { name: "Add block" })).toBeTruthy();
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

describe("Block extensions", () => {
    it("emits invalid and checked state and names the invalid marker by its reason", () => {
        const { container } = render(
            <BlockList aria-label="Blocks">
                <Block title="Hero" visible invalid invalidReason="Image is required" checked onCheckedChange={vi.fn()} />
                <Block title="Text" visible invalid />
            </BlockList>,
        );
        const [hero, text] = Array.from(container.querySelectorAll<HTMLElement>(".dextinityBlock"));

        expect([hero.dataset.invalid, hero.dataset.checkable, hero.dataset.checked]).toStrictEqual(["", "", ""]);
        expect(text.hasAttribute("data-checkable")).toBe(false);
        expect(screen.getByRole("img", { name: "Image is required" }).className).toContain("dextinityBlock__invalidMarker");
        expect(screen.getByRole("img", { name: "Contains errors" })).toBeTruthy();
    });

    it("passes the ref and attributes to the list item, to find a block for scrolling it into view", () => {
        const ref = createRef<HTMLLIElement>();
        render(
            <BlockList aria-label="Blocks">
                <Block ref={ref} data-block-key="hero" title="Hero" visible />
            </BlockList>,
        );

        expect(ref.current?.tagName).toBe("LI");
        expect(ref.current?.dataset.blockKey).toBe("hero");
    });
});

describe("BlockListHeader", () => {
    it("renders in the list's header row and reflects the selection in the checkbox and count", () => {
        const onSelectAllChange = vi.fn();
        const { container } = render(
            <BlockList aria-label="Blocks" header={<BlockListHeader count={4} selectedCount={2} onSelectAllChange={onSelectAllChange} />}>
                <Block title="Hero" visible />
            </BlockList>,
        );

        const header = container.querySelector<HTMLElement>(".dextinityBlockList__header");
        expect(header?.firstElementChild?.className).toContain("dextinityBlockListHeader");
        expect(screen.getByRole("checkbox", { name: "Select all blocks" }).getAttribute("aria-checked")).toBe("mixed");
        expect(screen.getByText("2 selected")).toBeTruthy();
    });
});
