import { type IRteOptions, type IRteRef, makeRteApi, Rte } from "@dextinity/admin-rte";
import { Box, Card, CardContent } from "@mui/material";
import { useRef } from "react";

import { PrintEditorState, useAutoFocus } from "./helper";

const rteOptions: IRteOptions = {
    supports: ["italic", "header-one", "header-two"],
    draftJsProps: {
        placeholder: "Placeholder",
    },
    maxBlocks: 1,
    standardBlockType: "header-two",
};

const [useRteApi] = makeRteApi();

export default {
    title: "@dextinity/admin-rte",
};

export const RteMaxBlocksSet = {
    render: () => {
        const { editorState, setEditorState } = useRteApi({
            defaultValue: JSON.stringify({
                blocks: [
                    {
                        key: "fe4ti",
                        text: "Only one block is accepted",
                        type: "header-one",
                        depth: 0,
                        inlineStyleRanges: [
                            {
                                offset: 9,
                                length: 5,
                                style: "ITALIC",
                            },
                        ],
                        entityRanges: [],
                        data: {},
                    },
                ],
                entityMap: {},
            }),
        });

        // focus the editor to see the cursor immediately
        const editorRef = useRef<IRteRef>(undefined);
        useAutoFocus(editorRef);

        return (
            <>
                <Box marginBottom={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Rte value={editorState} onChange={setEditorState} ref={editorRef} options={rteOptions} />
                        </CardContent>
                    </Card>
                </Box>
                <PrintEditorState editorState={editorState} />
            </>
        );
    },

    name: "Rte, maxBlocks set",
};
