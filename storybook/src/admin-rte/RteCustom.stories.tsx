import { type IRteOptions, type IRteRef, makeRteApi, Rte } from "@dextinity/admin-rte";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { useRef } from "react";

import { PrintEditorState, useAutoFocus } from "./helper";

const rteOptions: IRteOptions = {
    supports: ["italic", "header-one", "header-two", "ordered-list", "unordered-list"],
    listLevelMax: 3,
};

const [useRteApi] = makeRteApi();

export default {
    title: "@dextinity/admin-rte",
};

export const RteCustomized = {
    render: () => {
        const { editorState, setEditorState } = useRteApi();

        // focus the editor to see the cursor immediately
        const editorRef = useRef<IRteRef>(undefined);
        useAutoFocus(editorRef);

        return (
            <>
                <Box marginBottom={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography gutterBottom>
                                Copy and paste content from{" "}
                                <a
                                    target="_blank"
                                    rel="noreferrer"
                                    href="https://docs.google.com/document/d/1YjqkIMC3q4jAzy__-S4fb6mC_w9EssmA6aZbGYWFv80/edit#"
                                >
                                    https://docs.google.com/document/d/1YjqkIMC3q4jAzy__-S4fb6mC_w9EssmA6aZbGYWFv80/edit#
                                </a>{" "}
                                to test filtering.
                            </Typography>
                            <Rte value={editorState} onChange={setEditorState} ref={editorRef} options={rteOptions} />
                        </CardContent>
                    </Card>
                </Box>
                <PrintEditorState editorState={editorState} />
            </>
        );
    },

    name: "Rte, customized",
};
