import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BlockPicker, type BlockPickerItem } from "./BlockPicker";

afterEach(cleanup);

const items: BlockPickerItem[] = [
    { value: "text", label: "Text", category: "content" },
    { value: "image", label: "Image", description: "One picture", category: "media" },
    { value: "stage", label: "Stage", category: "media", keywords: ["hero"] },
    { value: "spacer", label: "Spacer" },
];
const categories = [
    { value: "content", label: "Content" },
    { value: "media", label: "Media" },
];

function sectionTitles() {
    return screen.queryAllByRole("heading").map((heading) => heading.textContent);
}

describe("BlockPicker", () => {
    it("groups the block types by category, with the recently used first and the uncategorized last", () => {
        render(
            <BlockPicker items={items} categories={categories} recent={["image", "unknown"]} query="" onQueryChange={vi.fn()} onSelect={vi.fn()} />,
        );

        expect(sectionTitles()).toStrictEqual(["Recently used", "Content", "Media", "Other"]);
        const recent = screen.getByRole("region", { name: "Recently used" });
        expect(
            within(recent)
                .getAllByRole("button")
                .map((button) => button.dataset.value),
        ).toStrictEqual(["image"]);
    });

    it("searches labels, descriptions, and keywords, hides the recently used, and adds the first match with Enter", () => {
        const onSelect = vi.fn();
        const { container } = render(
            <BlockPicker items={items} categories={categories} recent={["image"]} query="hero" onQueryChange={vi.fn()} onSelect={onSelect} />,
        );

        expect(sectionTitles()).toStrictEqual(["Media"]);
        expect((container.firstElementChild as HTMLElement).dataset.filtered).toBe("");
        expect(screen.getByRole("button", { name: "Stage" }).dataset.highlighted).toBe("");

        fireEvent.keyDown(screen.getByRole("searchbox", { name: "Search blocks" }), { key: "Enter" });
        expect(onSelect).toHaveBeenCalledWith("stage");
    });

    it("adds the first match shown, in the order of the categories, with Enter", () => {
        const onSelect = vi.fn();
        render(<BlockPicker items={items} categories={[...categories].reverse()} query="e" onQueryChange={vi.fn()} onSelect={onSelect} />);

        expect(sectionTitles()).toStrictEqual(["Media", "Content", "Other"]);
        expect(screen.getByRole("button", { name: /^Image/ }).dataset.highlighted).toBe("");

        fireEvent.keyDown(screen.getByRole("searchbox", { name: "Search blocks" }), { key: "Enter" });
        expect(onSelect).toHaveBeenCalledWith("image");
    });

    it("shows only the chosen category and says when nothing matches", () => {
        const { container, rerender } = render(
            <BlockPicker items={items} categories={categories} category="content" query="" onQueryChange={vi.fn()} onSelect={vi.fn()} />,
        );
        expect(sectionTitles()).toStrictEqual(["Content"]);

        rerender(<BlockPicker items={items} categories={categories} category="content" query="image" onQueryChange={vi.fn()} onSelect={vi.fn()} />);
        expect((container.firstElementChild as HTMLElement).dataset.empty).toBe("");
        expect(screen.getByRole("status").textContent).toBe("No block matches your search.");
    });
});
