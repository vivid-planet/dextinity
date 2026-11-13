import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../../field/Field";
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
    it("shows the chosen option before any options are loaded", () => {
        const loadOptions = vi.fn(async () => tags);
        render(
            <Combobox name="tag" aria-label="Tag" value={tags[1]} onChange={vi.fn()} loadOptions={loadOptions} getOptionLabel={(tag) => tag.title} />,
        );

        expect((screen.getByRole("combobox", { name: "Tag" }) as HTMLInputElement).value).toBe("Events");
        expect(loadOptions).not.toHaveBeenCalled();
    });

    it("follows the surrounding field", () => {
        render(
            <Field label="Tag" required disabled state="error" validationMessage="Choose a tag.">
                <Combobox name="tag" value={null} onChange={vi.fn()} loadOptions={async () => tags} getOptionLabel={(tag) => tag.title} />
            </Field>,
        );

        const input = screen.getByRole("combobox", { name: "Tag" });
        expect(input).toHaveAccessibleDescription("Choose a tag.");
        expect(input).toHaveAttribute("aria-required", "true");
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input).toBeDisabled();
    });

    it("names the chips' remove buttons by the option label", () => {
        render(
            <Field label="Tags">
                <Combobox<Tag, true>
                    name="tags"
                    value={tags}
                    onChange={vi.fn()}
                    loadOptions={async () => []}
                    getOptionLabel={(tag) => tag.title}
                    multiple
                />
            </Field>,
        );

        expect(screen.getAllByRole("button", { name: /^Remove/ }).map((button) => button.getAttribute("aria-label"))).toStrictEqual([
            "Remove News",
            "Remove Events",
        ]);
    });
});
