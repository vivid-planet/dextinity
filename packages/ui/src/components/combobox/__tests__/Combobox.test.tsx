import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Combobox } from "../Combobox";

interface Tag {
    id: number;
    title: string;
}

const tags: Tag[] = [
    { id: 1, title: "News" },
    { id: 2, title: "Events" },
];

afterEach(cleanup);

describe("Combobox", () => {
    it("composes the field root with its own root class and emits multiple", () => {
        const { container } = render(
            <Combobox<Tag, true>
                name="tags"
                label="Tags"
                value={[]}
                onChange={vi.fn()}
                loadOptions={async () => tags}
                getOptionLabel={(tag) => tag.title}
                multiple
            />,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityField");
        expect(root.className).toContain("dextinityCombobox");
        expect(root.dataset.multiple).toBe("");
    });

    it("shows the chosen option before any options are loaded", () => {
        const loadOptions = vi.fn(async () => tags);
        render(<Combobox name="tag" label="Tag" value={tags[1]} onChange={vi.fn()} loadOptions={loadOptions} getOptionLabel={(tag) => tag.title} />);

        expect((screen.getByRole("combobox", { name: "Tag" }) as HTMLInputElement).value).toBe("Events");
        expect(loadOptions).not.toHaveBeenCalled();
    });

    it("names the chips' remove buttons by the option label", () => {
        render(
            <Combobox<Tag, true>
                name="tags"
                label="Tags"
                value={tags}
                onChange={vi.fn()}
                loadOptions={async () => []}
                getOptionLabel={(tag) => tag.title}
                multiple
            />,
        );

        expect(screen.getAllByRole("button", { name: /^Remove/ }).map((button) => button.getAttribute("aria-label"))).toStrictEqual([
            "Remove News",
            "Remove Events",
        ]);
    });
});
