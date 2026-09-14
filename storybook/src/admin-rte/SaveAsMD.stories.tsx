import { type IMakeRteApiProps, makeRteApi, type OnDebouncedContentChangeFn, Rte } from "@dextinity/admin-rte";
import { Box, Card, CardContent } from "@mui/material";
import { stateToMarkdown } from "draft-js-export-markdown";
import { stateFromMarkdown } from "draft-js-import-markdown";
import { useState } from "react";

import { PrintAnything } from "./helper";

type Markdown = string;

const defaultValue: Markdown = `
# Headline 1

This is markdown
`;

const makeRteApiProps: IMakeRteApiProps<Markdown> = {
    parse: (v) => {
        return stateFromMarkdown(v);
    },
    format: (v) => {
        return stateToMarkdown(v);
    },
};

const [useRteApi] = makeRteApi<Markdown>(makeRteApiProps);

export default {
    title: "@dextinity/admin-rte/save-as",
};

export const SaveAsMd = {
    render: () => {
        const [savableContent, setSavableContent] = useState<Markdown>(defaultValue);

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
                <PrintAnything label="Save Value: Markdown">{savableContent}</PrintAnything>
            </>
        );
    },

    name: "Save as MD",
};
