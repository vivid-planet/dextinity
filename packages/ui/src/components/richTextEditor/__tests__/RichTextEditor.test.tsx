import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RichTextEditor } from "../RichTextEditor";

afterEach(cleanup);

describe("RichTextEditor", () => {
    it("composes the field root with its own root class and renders the sanitized value", () => {
        const { container } = render(
            <RichTextEditor name="text" label="Text" value='<p>Hi <b>there</b><img src="x" onerror="alert(1)"></p>' onChange={vi.fn()} />,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityField");
        expect(root.className).toContain("dextinityRichTextEditor");
        const editor = screen.getByRole("textbox", { name: "Text" });
        expect(editor.className).toContain("dextinityRichTextEditor__content");
        expect(editor.innerHTML).toBe("<p>Hi <b>there</b></p>");
    });

    it("offers only the formats in `toolbar`", () => {
        render(<RichTextEditor name="text" label="Text" value="" onChange={vi.fn()} toolbar={["bold", "link"]} />);

        expect(screen.getAllByRole("button").map((button) => button.getAttribute("aria-label"))).toStrictEqual(["Bold", "Link"]);
    });

    it("is not editable while disabled or read-only", () => {
        render(<RichTextEditor name="text" label="Text" value="" onChange={vi.fn()} readOnly />);

        const editor = screen.getByRole("textbox");
        expect([editor.getAttribute("contenteditable"), editor.getAttribute("aria-readonly")]).toStrictEqual(["false", "true"]);
    });
});
