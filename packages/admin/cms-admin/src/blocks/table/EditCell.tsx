import { Box, Popper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { type GridRenderEditCellParams, useGridApiContext } from "@mui/x-data-grid-pro";
import { useCallback, useState } from "react";

import { resolveNewState } from "../utils";
import { useTableBlockContext } from "./TableBlockContext";

export const EditCell = ({ id, field, value }: GridRenderEditCellParams) => {
    const { RichTextBlock } = useTableBlockContext();
    const [valueState, setValueState] = useState(value);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>();
    const apiRef = useGridApiContext();

    const handleRef = useCallback((el: HTMLElement | null) => {
        setAnchorEl(el);
    }, []);

    return (
        <Root>
            <EditCellHandle ref={handleRef} />
            <EditPopper open={!!anchorEl} anchorEl={anchorEl} placement="bottom-start">
                <EditorWrapper
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
}));
