import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RichTextEditor } from "../RichTextEditor";

afterEach(cleanup);

describe("RichTextEditor", () => {
    it("composes the field root with its own root class and keeps only the enabled formatting of the value", () => {
        const { container } = render(
            <RichTextEditor
                name="text"
                label="Text"
                value='<p>Hi <b>there</b> <u>under</u><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">x</a></p>'
                onChange={vi.fn()}
            />,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityField");
        expect(root.className).toContain("dextinityRichTextEditor");
        const editor = screen.getByRole("textbox", { name: "Text" });
        expect(editor.className).toContain("dextinityRichTextEditor__content");
        expect(editor.innerHTML).toBe("<p>Hi <strong>there</strong> underx</p>");
    });

    it("offers only the formats in `toolbar`", () => {
        render(<RichTextEditor name="text" label="Text" value="" onChange={vi.fn()} toolbar={["bold", "link"]} />);

        expect(screen.getAllByRole("button").map((button) => button.getAttribute("aria-label"))).toStrictEqual(["Bold", "Link", "Remove link"]);
    });

    it("keeps headings of the offered levels and turns the others into paragraphs", () => {
        render(<RichTextEditor name="text" label="Text" value="<h2>Two</h2><h5>Five</h5>" onChange={vi.fn()} headingLevels={[2, 3]} />);

        expect(screen.getByRole("textbox").innerHTML).toBe("<h2>Two</h2><p>Five</p>");
    });

    it("keeps placeholders, special characters, and inline styles it knows", () => {
        const value =
            '<p><span data-type="placeholder" data-name="firstName">{{firstName}}</span><span data-type="non-breaking-space"> </span><span data-inline-style="productName">Dextinity</span><span data-inline-style="unknown">plain</span></p>';
        render(
            <RichTextEditor
                name="text"
                label="Text"
                value={value}
                onChange={vi.fn()}
                textPlaceholders={[{ name: "firstName", label: "First name" }]}
                inlineStyles={[{ name: "productName", label: "Product name" }]}
            />,
        );

        expect((document.querySelector("input[type=hidden]") as HTMLInputElement).value).toBe(value);
        const editor = screen.getByRole("textbox");
        expect(editor.querySelector('[data-type="placeholder"]')?.textContent).toBe("{{firstName}}");
        expect(editor.querySelector('[data-type="non-breaking-space"]')).not.toBeNull();
        expect(editor.querySelector('[data-inline-style="productName"]')?.textContent).toBe("Dextinity");
        expect(editor.querySelector('[data-inline-style="unknown"]')).toBeNull();
    });

    it("is not editable while disabled or read-only", () => {
        render(<RichTextEditor name="text" label="Text" value="" onChange={vi.fn()} readOnly />);

        const editor = screen.getByRole("textbox");
        expect([editor.getAttribute("contenteditable"), editor.getAttribute("aria-readonly")]).toStrictEqual(["false", "true"]);
    });
});
