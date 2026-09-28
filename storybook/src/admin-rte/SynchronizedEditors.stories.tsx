import { type IRteRef, makeRteApi, Rte } from "@dextinity/admin-rte";
import { Grid, Typography } from "@mui/material";
import { EditorState } from "draft-js";
import { useRef, useState } from "react";

import { PrintEditorState, useAutoFocus } from "./helper";

const [useRteApi] = makeRteApi();

export default {
    title: "@dextinity/admin-rte",
};

export const SynchronizedRtEs = {
    render: () => {
        const { editorState, setEditorState } = useRteApi();
        const [activeEditor, setActiveEditor] = useState<"left" | "right">("left");

        // focus the editor to see the cursor immediately
        const leftEditorRef = useRef<IRteRef>(undefined);
        useAutoFocus(leftEditorRef);

        return (
            <Grid container spacing={4}>
                <Grid size={6}>
                    <Typography variant="h4" gutterBottom>
                        Left Editor
                    </Typography>
                    <Rte
                        // Use EditorState.createWithContent(editorState.getCurrentContent()) to update state without losing focus in the active editor
                        value={activeEditor === "left" ? editorState : EditorState.createWithContent(editorState.getCurrentContent())}
                        onChange={(value) => {
                            setEditorState(value);
                            setActiveEditor("left");
                        }}
                        ref={leftEditorRef}
                    />
                </Grid>
                <Grid size={6}>
                    <Typography variant="h4" gutterBottom>
                        Right Editor
                    </Typography>
                    <Rte
                        // Use EditorState.createWithContent(editorState.getCurrentContent()) to update state without losing focus in the active editor
                        value={activeEditor === "right" ? editorState : EditorState.createWithContent(editorState.getCurrentContent())}
                        onChange={(value) => {
                            setEditorState(value);
                            setActiveEditor("right");
                        }}
                    />
                </Grid>
                <Grid size={12}>
                    <PrintEditorState editorState={editorState} />
                </Grid>
            </Grid>
        );
    },

    name: "Synchronized RTEs",
};
