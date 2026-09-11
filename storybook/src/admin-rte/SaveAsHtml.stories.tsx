import { type IMakeRteApiProps, makeRteApi, type OnDebouncedContentChangeFn, Rte } from "@dextinity/admin-rte";
import { Box, Card, CardContent } from "@mui/material";
import { ContentState, convertFromHTML } from "draft-js";
import { stateToHTML } from "draft-js-export-html";
import { useState } from "react";

import { PrintAnything } from "./helper";

type Html = string;

const defaultValue: Html = "<p>save-format is <b>HTML</b></p>";

const makeRteApiProps: IMakeRteApiProps<Html> = {
    parse: (v) => {
        const blocksFromHTML = convertFromHTML(v);
        return ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);
    },
    format: (v) => {
        return stateToHTML(v);
    },
};

const [useRteApi] = makeRteApi<Html>(makeRteApiProps);

export default {
    title: "@dextinity/admin-rte/save-as",
};

export const SaveAsHtml = {
    render: () => {
        const [savableContent, setSavableContent] = useState<Html>(defaultValue);

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
                <PrintAnything label="Save Value: Html">{savableContent}</PrintAnything>
            </>
        );
    },

    name: "Save as HTML",
};
