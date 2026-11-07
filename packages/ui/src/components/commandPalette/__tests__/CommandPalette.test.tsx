import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CommandPalette, type CommandPaletteGroup } from "../CommandPalette";

const groups: CommandPaletteGroup[] = [
    {
        label: "Jump to",
        items: [
            { id: "jobs", label: "Job ads", keywords: ["careers"], onSelect: vi.fn() },
            { id: "assets", label: "Assets", onSelect: vi.fn() },
        ],
    },
    { label: "Create", items: [{ id: "new", label: "New page", onSelect: vi.fn() }] },
];

afterEach(cleanup);

describe("CommandPalette render contract", () => {
    it("filters by label and keywords, leaves out empty groups, and marks the first match active", () => {
        render(<CommandPalette open onOpenChange={vi.fn()} query="career" onQueryChange={vi.fn()} groups={groups} />);

        const dialog = screen.getByRole("dialog", { name: "Command palette" });
        expect(dialog.className).toContain("dextinityCommandPalette");
        expect(dialog.dataset.filter).toBe("");
        expect(screen.getAllByRole("group").map((group) => group.textContent)).toStrictEqual(["Jump toJob ads"]);
        const option = screen.getByRole("option", { name: "Job ads" });
        expect(option.getAttribute("aria-selected")).toBe("true");
        expect(screen.getByRole("combobox").getAttribute("aria-activedescendant")).toBe(option.id);
    });

    it("highlights the matched part of a label", () => {
        render(<CommandPalette open onOpenChange={vi.fn()} query="ass" onQueryChange={vi.fn()} groups={groups} />);

        expect(screen.getByRole("option", { name: "Assets" }).querySelector("mark")?.textContent).toBe("Ass");
    });

    it("shows all entries unfiltered when filter is off", () => {
        render(<CommandPalette open onOpenChange={vi.fn()} query="zzz" onQueryChange={vi.fn()} groups={groups} filter={false} />);

        expect(screen.getAllByRole("option")).toHaveLength(3);
    });
});
