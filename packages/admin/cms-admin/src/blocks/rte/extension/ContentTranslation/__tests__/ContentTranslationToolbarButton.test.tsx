import { useContentTranslationService } from "@dextinity/admin";
import type { IRteOptions } from "@dextinity/admin-rte";
import { ContentState, EditorState } from "draft-js";
import { cleanup, fireEvent, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it, type Mock, vi } from "vitest";

import { ContentTranslationToolbarButton } from "../ContentTranslationToolbarButton";

vi.mock("@dextinity/admin", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@dextinity/admin")>()),
    useContentTranslationService: vi.fn(),
}));

const options = { supports: ["bold"], standardBlockType: "unstyled" } as unknown as IRteOptions;

function renderButton() {
    const setEditorState = vi.fn();
    render(
        <ContentTranslationToolbarButton
            editorState={EditorState.createWithContent(ContentState.createFromText("Hallo Welt"))}
            setEditorState={setEditorState}
            options={options}
        />,
    );
    return { setEditorState };
}

describe("ContentTranslationToolbarButton", () => {
    afterEach(() => {
        cleanup();
    });

    it("replaces the content with its translation", async () => {
        const translate = vi.fn(async (html: string) => html.replace("Hallo Welt", "Hello world"));
        (useContentTranslationService as Mock).mockReturnValue({ enabled: true, translate, showApplyTranslationDialog: false });
        const { setEditorState } = renderButton();

        fireEvent.mouseDown(screen.getByRole("button", { name: "Translate" }));

        await waitFor(() => expect(setEditorState).toHaveBeenCalled());
        expect(translate).toHaveBeenCalledWith(expect.stringContaining("Hallo Welt"));
        const editorState: EditorState = setEditorState.mock.calls[0][0];
        expect(editorState.getCurrentContent().getPlainText()).toBe("Hello world");
    });

    it("applies the translation after reviewing it in a dialog", async () => {
        const translate = vi.fn(async (html: string) => html.replace("Hallo Welt", "Hello world"));
        (useContentTranslationService as Mock).mockReturnValue({ enabled: true, translate, showApplyTranslationDialog: true });
        const { setEditorState } = renderButton();

        fireEvent.mouseDown(screen.getByRole("button", { name: "Translate" }));

        const dialog = await screen.findByRole("dialog", { name: "Translation" });
        expect(dialog.textContent).toContain("Hallo Welt");
        expect(dialog.textContent).toContain("Hello world");
        expect(setEditorState).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole("button", { name: "Apply" }));

        await waitFor(() => expect(setEditorState).toHaveBeenCalled());
        expect((setEditorState.mock.calls[0][0] as EditorState).getCurrentContent().getPlainText()).toBe("Hello world");
        await waitFor(() => expect(screen.queryByRole("dialog", { name: "Translation" })).toBeNull());
    });
});
