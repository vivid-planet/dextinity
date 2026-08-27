import { type IMakeRteApiProps, type IRteApiProps, type IRteOptions, type IRteRef, LinkDecorator, makeRteApi, Rte } from "@dextinity/admin-rte";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { convertFromRaw, convertToRaw } from "draft-js";
import { type ReactNode, useRef } from "react";

import { exampleContent, PrintEditorState, useAutoFocus } from "./helper";

type StringifiedRawDraftContentState = string;

export type ContentFormat = StringifiedRawDraftContentState;

export const defaultContent: ContentFormat = JSON.stringify(exampleContent);

export const makeApiOptions: IMakeRteApiProps<ContentFormat> = {
    decorators: [LinkDecorator], // define additional Draft decorators, https://draftjs.org/docs/advanced-topics-decorators/
    parse: (v) => convertFromRaw(JSON.parse(v)), // parse your content-format to draft-js internal ContentState
    format: (v) => JSON.stringify(convertToRaw(v)), // format draft-js internal ContentState to your content-format
};

export const apiOptions: IRteApiProps<ContentFormat> = {
    defaultValue: defaultContent, // initial content of the editor
    onDebouncedContentChange: (editorState, convertEditorStateToRawContent) => {
        convertEditorStateToRawContent(editorState); // save this result to your api
    }, // receive updates of editorstate
    debounceDelay: 400, // delay when onDebouncedContentChange after editor content changed
};

const RedCustomHeader = ({ children }: { children?: ReactNode }) => (
    <Typography variant="h1" style={{ color: "red" }}>
        {children}
    </Typography>
);
const GreenCustomHeader = ({ children }: { children?: ReactNode }) => <h2 style={{ color: "green" }}>{children}</h2>;

export const rteOptions: IRteOptions = {
    supports: [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "sub",
        "sup",
        "header-one",
        "header-two",
        "header-three",
        "header-four",
        "header-five",
        "header-six",
        "blockquote",
        "ordered-list",
        "unordered-list",
        "history",
        "link",
        "links-remove",
        "non-breaking-space",
        "soft-hyphen",
    ],
    listLevelMax: 2,
    blocktypeMap: {
        // overwrite built-in blocktypes
        unstyled: {
            label: "DEFAULT",
        },
        "header-one": {
            label: "HEADING 1",
            // more on this setting here:
            // https://draftjs.org/docs/advanced-topics-custom-block-render-map/#configuring-block-render-map
            renderConfig: {
                element: (p) => <RedCustomHeader {...p} />,
                aliasedElements: ["h1"],
            },
        },
        // define new blocktypes
        "header-custom-green": {
            label: "Custom Green Header",
            renderConfig: {
                element: (p) => <GreenCustomHeader {...p} />,
                aliasedElements: ["h2"],
            },
        },

        "ordered-list-item": {
            // this is funky: moves the ordered-list-item to the dropdown (not recommended to change the default behaviour)
            group: "dropdown",
        },
    },
    draftJsProps: {
        placeholder: "Your Content...",
        autoCorrect: "on",
        autoComplete: "on",
        editorKey: "id-for-ssr",
        readOnly: false,
        spellCheck: true,
        stripPastedStyles: false,
        tabIndex: 0,
    },
    filterEditorStateBeforeUpdate: (state) => state, // removes default filter
    maxBlocks: undefined,
    standardBlockType: "unstyled",
};

const [useRteApi] = makeRteApi<ContentFormat>(makeApiOptions);

export default {
    title: "@dextinity/admin-rte",

    excludeStories: ["ContentFormat", "defaultContent", "makeApiOptions", "apiOptions", "rteOptions"],
};

export const RteAllOptions = {
    render: () => {
        const { editorState, setEditorState } = useRteApi(apiOptions);

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

    name: "Rte, all options",
};
