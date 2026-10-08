import { Box, Popper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { type GridRenderEditCellParams, useGridApiContext } from "@mui/x-data-grid-pro";
import { useCallback, useEffect, useState } from "react";

import { resolveNewState } from "../utils";
import { useTableBlockContext } from "./TableBlockContext";

export const EditCell = ({ id, field, value }: GridRenderEditCellParams) => {
    const { RichTextBlock } = useTableBlockContext();
    const [valueState, setValueState] = useState(value);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>();
    const [editorWrapper, setEditorWrapper] = useState<HTMLElement | null>(null);
    const apiRef = useGridApiContext();

    const handleRef = useCallback((el: HTMLElement | null) => {
        setAnchorEl(el);
    }, []);

    useEffect(() => {
        if (!editorWrapper) {
            return;
        }

        // Wait for TipTap to render its content, like TipTap's own focus command does:
        // https://github.com/ueberdosis/tiptap/blob/626b052fa2098c8d5b20abb2e60fa6d7711d46af/packages/core/src/commands/focus.ts#L59-L61
        const animationFrame = requestAnimationFrame(() => focusEditorAtEnd(editorWrapper));
        return () => cancelAnimationFrame(animationFrame);
    }, [editorWrapper]);

    return (
        <Root>
            <EditCellHandle ref={handleRef} />
            <EditPopper open={!!anchorEl} anchorEl={anchorEl} placement="bottom-start">
                <EditorWrapper
                    ref={setEditorWrapper}
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            apiRef.current.stopCellEditMode({ id, field });
                        }
                        event.stopPropagation();
                    }}
                >
                    <RichTextBlock.AdminComponent
                        state={valueState}
                        updateState={(setStateAction) => {
                            const newContent = resolveNewState({ prevState: valueState, setStateAction });

                            setValueState(newContent);
                            apiRef.current.setEditCellValue({ id, field, value: newContent, debounceMs: 200 });
                        }}
                    />
                </EditorWrapper>
            </EditPopper>
        </Root>
    );
};

const focusEditorAtEnd = (editorWrapper: HTMLElement) => {
    const editable = editorWrapper.querySelector<HTMLElement>('[contenteditable="true"]');
    if (!editable) {
        return;
    }

    editable.focus();
    moveCaretToEnd(editable);
    editable.scrollIntoView({ block: "end" });
};

const moveCaretToEnd = (element: HTMLElement) => {
    window.getSelection()?.collapse(element, element.childNodes.length);
};

const Root = styled("div")({
    position: "relative",
});

const EditCellHandle = styled("div")({
    position: "absolute",
    top: 0,
});

const EditPopper = styled(Popper)(({ theme }) => ({
    zIndex: theme.zIndex.modal - 1,
    maxWidth: 460,
}));

const EditorWrapper = styled(Box)(({ theme }) => ({
    position: "relative",
    boxShadow: theme.shadows[1],

    "& :has(> .DextinityAdminRteToolbar-root, > .DextinityAdminTipTapToolbar-root)": {
        maxHeight: "60vh",
        overflowY: "auto",
    },
}));
