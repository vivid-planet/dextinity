import { convertFromRaw, EditorState, SelectionState } from "draft-js";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it } from "vitest";

import { createBlockSkeleton } from "../../../helpers/createBlockSkeleton";
import { BlockCategory } from "../../../types";
import { createCmsLinkToolbarButton } from "./createCmsLinkToolbarButton";
import { ENTITY_TYPE } from "./Decorator";

afterEach(cleanup);

type LinkState = { url: string };

const LinkBlock = {
    ...createBlockSkeleton(),
    name: "Link",
    displayName: "Link",
    category: BlockCategory.Navigation,
    defaultValues: (): LinkState => ({ url: "" }),
    AdminComponent: ({ state, updateState }: { state: LinkState; updateState: (state: LinkState) => void }) => (
        <label>
            URL
            <input value={state.url} onChange={(event) => updateState({ url: event.target.value })} />
        </label>
    ),
};

const ToolbarButton = createCmsLinkToolbarButton({ link: LinkBlock });

function createEditorStateWithSelection({ withLink }: { withLink: boolean }) {
    const content = convertFromRaw({
        blocks: [
            {
                key: "first",
                text: "Hello world",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: withLink ? [{ offset: 0, length: 5, key: 0 }] : [],
            },
        ],
        entityMap: withLink ? { 0: { type: ENTITY_TYPE, mutability: "MUTABLE", data: { url: "https://example.com" } } } : {},
    });
    const editorState = EditorState.createWithContent(content);
    const selection = SelectionState.createEmpty("first").merge({ anchorOffset: 0, focusOffset: 5 });
    return EditorState.forceSelection(editorState, selection);
}

function linkEntityOfFirstCharacter(editorState: EditorState) {
    const content = editorState.getCurrentContent();
    const entityKey = content.getFirstBlock().getEntityAt(0);
    return entityKey ? content.getEntity(entityKey) : null;
}

function renderToolbarButton(initialEditorState: EditorState) {
    const result: { editorState: EditorState } = { editorState: initialEditorState };

    function Editor() {
        const [editorState, setEditorState] = useState(initialEditorState);
        result.editorState = editorState;
        return <ToolbarButton editorState={editorState} setEditorState={setEditorState} />;
    }

    render(<Editor />);
    return result;
}

describe("createCmsLinkToolbarButton", () => {
    it("links the selected text with the state of the link block", async () => {
        const result = renderToolbarButton(createEditorStateWithSelection({ withLink: false }));

        fireEvent.mouseDown(screen.getByRole("button"));
        await screen.findByRole("dialog", { name: "Insert link" });
        fireEvent.change(screen.getByLabelText("URL"), { target: { value: "https://dextinity.example" } });
        fireEvent.click(screen.getByRole("button", { name: "OK" }));

        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        const entity = linkEntityOfFirstCharacter(result.editorState);
        expect(entity?.getType()).toBe(ENTITY_TYPE);
        expect(entity?.getData()).toEqual({ url: "https://dextinity.example" });
    });

    it("removes an existing link", async () => {
        const result = renderToolbarButton(createEditorStateWithSelection({ withLink: true }));

        fireEvent.mouseDown(screen.getByRole("button"));
        await screen.findByRole("dialog", { name: 'Edit link "Hello"' });
        expect(screen.getByLabelText<HTMLInputElement>("URL").value).toBe("https://example.com");
        fireEvent.click(screen.getByRole("button", { name: "Delete Link" }));

        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(linkEntityOfFirstCharacter(result.editorState)).toBeNull();
    });
});
