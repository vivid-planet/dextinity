import { makeRteApi, Rte } from "@dextinity/admin-rte";
import { ContentState, convertFromHTML } from "draft-js";
import { stateToHTML } from "draft-js-export-html";
import { stateToMarkdown } from "draft-js-export-markdown";
import { stateFromMarkdown } from "draft-js-import-markdown";

export default {
    title: "Docs/Components/Rich Text Editor",
};

export const Minimal = {
    render: () => {
        const [useRteApi] = makeRteApi();

        const { editorState, setEditorState } = useRteApi();

        return <Rte value={editorState} onChange={setEditorState} />;
    },
};

const PrettyJson = ({ children }: { children: string }) => <pre>{JSON.stringify(JSON.parse(children), null, 2)}</pre>;

export const SourceDataDefault = {
    render: () => {
        const [useRteApi, { convertStateToRawContent }] = makeRteApi();

        const { editorState, setEditorState } = useRteApi({
            defaultValue: JSON.stringify({
                blocks: [
                    { key: "1g5a1", text: "Headline 1", type: "header-one", depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} },
                    { key: "4qaer", text: "Paragraph", type: "unstyled", depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} },
                ],
                entityMap: {},
            }),
        });

        return (
            <>
                <Rte value={editorState} onChange={setEditorState} />

                <p>Send this to the server:</p>
                <PrettyJson>{convertStateToRawContent(editorState)}</PrettyJson>
            </>
        );
    },
};

export const SourceDataMarkdown = {
    render: () => {
        const [useRteApi, { convertStateToRawContent }] = makeRteApi({
            parse: (v) => {
                return stateFromMarkdown(v);
            },
            format: (v) => {
                return stateToMarkdown(v);
            },
        });

        const { editorState, setEditorState } = useRteApi({
            defaultValue: `
    # Headline 1
        
    This is markdown
        `,
        });

        return (
            <>
                <Rte value={editorState} onChange={setEditorState} />

                <p>Send this to the server:</p>
                <pre>{convertStateToRawContent(editorState)}</pre>
            </>
        );
    },
};

export const SourceDataHtml = {
    render: () => {
        type Html = string;

        const [useRteApi, { convertStateToRawContent }] = makeRteApi<Html>({
            parse: (v) => {
                const blocksFromHTML = convertFromHTML(v);
                return ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);
            },
            format: (v) => {
                return stateToHTML(v);
            },
        });

        const { editorState, setEditorState } = useRteApi({
            defaultValue: `
    <h1>Headline 1</h1>
    <p>This is html</p>
        `,
        });

        return (
            <>
                <Rte value={editorState} onChange={setEditorState} />

                <p>Send this to the server:</p>
                <pre>{convertStateToRawContent(editorState)}</pre>
            </>
        );
    },
};
