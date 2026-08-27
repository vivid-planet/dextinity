import { type IMakeRteApiProps, makeRteApi, type OnDebouncedContentChangeFn, Rte } from "@dextinity/admin-rte";
import { Box, Card, CardContent } from "@mui/material";
import { convertFromRaw, convertToRaw, type RawDraftContentState } from "draft-js";
import { useState } from "react";

import { PrintAnything } from "./helper";

const defaultValue: RawDraftContentState = {
    blocks: [
        {
            key: "3v61q",
            text: "save-format is rawDraftJsObject",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [
                {
                    offset: 15,
                    length: 16,
                    style: "BOLD",
                },
            ],
            entityRanges: [],
            data: {},
        },
        {
            key: "7cbdf",
            text: "",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
    ],
    entityMap: {},
};

const makeRteApiProps: IMakeRteApiProps<RawDraftContentState> = {
    parse: (v) => convertFromRaw(v),
    format: (v) => convertToRaw(v),
};

const [useRteApi] = makeRteApi<RawDraftContentState>(makeRteApiProps);

export default {
    title: "@dextinity/admin-rte/save-as",
};

export const SaveAsRawDraftJsObject = {
    render: () => {
        const [savableContent, setSavableContent] = useState<RawDraftContentState>(defaultValue);

        const handleDebouncedContentChange: OnDebouncedContentChangeFn = (innerEditorState, convertStateToRawContent) => {
            setSavableContent(convertStateToRawContent(innerEditorState));
        };
        const { editorState, setEditorState } = useRteApi({ defaultValue, onDebouncedContentChange: handleDebouncedContentChange });

        return (
            <>
                <Box marginBottom={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Rte value={editorState} onChange={setEditorState} />
                        </CardContent>
                    </Card>
                </Box>
                <PrintAnything label="Save Value: RawDraftJs (not stringified)">{savableContent}</PrintAnything>
            </>
        );
    },

    name: "Save as Raw DraftJs Object",
};
