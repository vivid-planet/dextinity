import { Editor, type JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { afterEach, describe, expect, it } from "vitest";

import { NonBreakingSpace } from "./NonBreakingSpace";

const nonBreakingSpaceCharacter = String.fromCharCode(0xa0);

let editor: Editor | undefined;

function createEditor(content?: JSONContent) {
    editor = new Editor({ extensions: [StarterKit, NonBreakingSpace], content });
    return editor;
}

function paragraphContent(editor: Editor) {
    return editor.getJSON().content?.[0].content;
}

afterEach(() => {
    editor?.destroy();
    editor = undefined;
});

describe("NonBreakingSpace", () => {
    it("should turn a typed non-breaking space character into the node the toolbar button inserts, so it is visible in the editor", () => {
        const editor = createEditor();

        editor.commands.insertContent(`1${nonBreakingSpaceCharacter}000 €`);

        expect(paragraphContent(editor)).toEqual([{ type: "text", text: "1" }, { type: "nonBreakingSpace" }, { type: "text", text: "000 €" }]);
    });

    it("should keep the marks of a converted character", () => {
        const editor = createEditor();

        editor.chain().toggleBold().insertContent(`1${nonBreakingSpaceCharacter}000`).run();

        expect(paragraphContent(editor)?.[1]).toEqual({ type: "nonBreakingSpace", marks: [{ type: "bold" }] });
    });

    it("should leave loaded content untouched until it is edited, so opening it doesn't count as a change", () => {
        const content: JSONContent = {
            type: "doc",
            content: [{ type: "paragraph", content: [{ type: "text", text: `1${nonBreakingSpaceCharacter}000` }] }],
        };

        const editor = createEditor(content);

        expect(editor.getJSON()).toEqual(content);
    });

    it("should keep the non-breaking space in the plain text, which is what copying as text uses", () => {
        const editor = createEditor();

        editor.commands.insertContent([{ type: "text", text: "1" }, { type: "nonBreakingSpace" }, { type: "text", text: "000" }]);

        expect(editor.getText()).toBe(`1${nonBreakingSpaceCharacter}000`);
    });

    it("should render a span ProseMirror doesn't replace with a regular space when pasting in Chrome", () => {
        const editor = createEditor();
        editor.commands.insertNonBreakingSpace();

        const container = document.createElement("div");
        container.innerHTML = editor.getHTML();

        // The selector ProseMirror's restoreReplacedSpaces uses in Chrome
        expect(container.querySelector("span:not([class]):not([style])")).toBeNull();
        expect(container.querySelector("span[data-type='non-breaking-space']")?.textContent).toBe(nonBreakingSpaceCharacter);
    });
});
