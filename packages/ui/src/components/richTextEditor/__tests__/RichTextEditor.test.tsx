import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RichTextEditor } from "../RichTextEditor";

const editorCreation = vi.hoisted(() => ({ deferred: false }));

vi.mock("@tiptap/react", async (importOriginal) => {
    const tiptapReact = await importOriginal<typeof import("@tiptap/react")>();
    return {
        ...tiptapReact,
        useEditor: (...args: Parameters<typeof tiptapReact.useEditor>) => {
            const editor = tiptapReact.useEditor(...args);
            return editorCreation.deferred ? null : editor;
        },
    };
});

afterEach(() => {
    cleanup();
    editorCreation.deferred = false;
});

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

    it("keeps only the target of links", () => {
        render(
            <RichTextEditor
                name="text"
                label="Text"
                value='<p><a href="https://example.com" target="_blank" rel="opener" class="evil" title="Title">x</a></p>'
                onChange={vi.fn()}
            />,
        );

        expect(screen.getByRole("textbox").innerHTML).toBe('<p><a href="https://example.com">x</a></p>');
    });

    it("drops placeholders it doesn't know", () => {
        render(
            <RichTextEditor
                name="text"
                label="Text"
                value='<p><span data-type="placeholder" data-name="lastName">{{lastName}}</span></p>'
                onChange={vi.fn()}
                textPlaceholders={[{ name: "firstName", label: "First name" }]}
            />,
        );

        expect(screen.getByRole("textbox").querySelector('[data-type="placeholder"]')).toBeNull();
    });

    it("offers and keeps only the alignments in `textAlignments`", () => {
        render(
            <RichTextEditor
                name="text"
                label="Text"
                value='<p style="text-align: center">Center</p><p style="text-align: right">Right</p>'
                onChange={vi.fn()}
                toolbar={["textAlign"]}
                textAlignments={["left", "center"]}
            />,
        );

        expect(screen.getAllByRole("button").map((button) => button.getAttribute("aria-label"))).toStrictEqual(["Align left", "Align center"]);
        expect(screen.getByRole("textbox").innerHTML).toBe('<p style="text-align: center;">Center</p><p>Right</p>');
    });

    it("turns lists nested deeper than `listLevelMax` into paragraphs of their parent item without emitting a change", async () => {
        const onChange = vi.fn();
        render(
            <RichTextEditor
                name="text"
                label="Text"
                value="<ul><li><p>One</p><ul><li><p>Two</p><ul><li><p>Three</p></li></ul></li></ul></li></ul>"
                onChange={onChange}
                listLevelMax={2}
            />,
        );

        await waitFor(() =>
            expect(screen.getByRole("textbox").innerHTML).toBe("<ul><li><p>One</p><ul><li><p>Two</p><p>Three</p></li></ul></li></ul>"),
        );
        expect(onChange).not.toHaveBeenCalled();
    });

    it("renders a disabled toolbar until the editor exists, as under SSR and in Next.js", () => {
        editorCreation.deferred = true;
        render(<RichTextEditor name="text" label="Text" value="<p>Hi</p>" onChange={vi.fn()} />);

        expect(screen.getByRole("toolbar")).toHaveAttribute("data-disabled");
        expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-disabled", "true");
    });

    it("renders on the server", () => {
        expect(renderToString(<RichTextEditor name="text" label="Text" value="<p>Hi</p>" onChange={vi.fn()} />)).toContain('role="toolbar"');
    });
});
