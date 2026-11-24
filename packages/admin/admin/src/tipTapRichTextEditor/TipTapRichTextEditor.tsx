import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { EditorContent, type JSONContent, useEditor } from "@tiptap/react";
import { deepEqual } from "fast-equals";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";

import { useErrorDialog } from "../error/errordialog/useErrorDialog";
import { greyPalette } from "../theme/colors";
import { useContentTranslationService } from "../translator/useContentTranslationService";
import { buildTipTapExtensions } from "./buildExtensions";
import { translateTipTapContent } from "./contentTranslation";
import { ContentTranslationDialog } from "./ContentTranslationDialog";
import { InlineStyleContext } from "./InlineStyleContext";
import { getListNestingDepthFromJson, trimListNesting } from "./listLevelMaxHelpers";
import { resolveTipTapOptions, type TipTapResolvedOptions, type TipTapRichTextEditorOptions } from "./options";
import { TextBlockContext } from "./TextBlockContext";
import { TipTapRichTextEditorToolbar } from "./TipTapRichTextEditorToolbar";

const ReadOnlyContent = styled("div")({
    ".tiptap > :first-child, .tiptap > :first-child > :first-child": {
        marginTop: 0,
    },

    ".tiptap > :last-child, .tiptap > :last-child > :last-child": {
        marginBottom: 0,
    },
});

export interface TipTapRichTextEditorProps {
    value: JSONContent;
    onChange?: (value: JSONContent) => void;
    options?: TipTapRichTextEditorOptions;
    readOnly?: boolean;
}

export function TipTapRichTextEditor({ options, ...props }: TipTapRichTextEditorProps) {
    const resolvedOptions = useMemo(() => resolveTipTapOptions(options), [options]);
    return <ResolvedTipTapRichTextEditor resolvedOptions={resolvedOptions} {...props} />;
}

interface ResolvedTipTapRichTextEditorProps extends Omit<TipTapRichTextEditorProps, "options"> {
    resolvedOptions: TipTapResolvedOptions;
}

export const ResolvedTipTapRichTextEditor = ({ value, onChange, resolvedOptions, readOnly }: ResolvedTipTapRichTextEditorProps) => {
    const { maxTextBlocks, listLevelMax, minHeight } = resolvedOptions;

    // Content the editor holds that hasn't come back through `value` yet. Matched by identity, not by
    // value: content set from outside can be equal to one of these and still has to be applied.
    // Seeded with the content useEditor is created with, which the editor already holds at mount.
    const contentEmittedByEditor = useRef<JSONContent[]>([value]);

    const extensions = buildTipTapExtensions(resolvedOptions);
    const textBlockContextValue = {
        textBlocks: resolvedOptions.textBlocks,
        orderedList: resolvedOptions.orderedList,
        unorderedList: resolvedOptions.unorderedList,
    };

    const editor = useEditor({
        extensions,
        content: value,
        editable: !readOnly,
        onUpdate: ({ editor }) => {
            if (maxTextBlocks !== undefined && editor.state.doc.childCount > maxTextBlocks) {
                // Remove excess text blocks (e.g. from paste)
                const { tr } = editor.state;
                const doc = editor.state.doc;
                // Find the resolved position after the maxTextBlocks-th child
                let pos = 0;
                for (let i = 0; i < maxTextBlocks; i++) {
                    pos += doc.child(i).nodeSize;
                }
                tr.delete(pos, doc.content.size);
                editor.view.dispatch(tr);
                return;
            }

            if (listLevelMax !== undefined) {
                const json = editor.getJSON();
                const currentDepth = getListNestingDepthFromJson(json);
                if (currentDepth > listLevelMax) {
                    // Trim nested lists that exceed the limit (e.g. from paste)
                    const trimmed = trimListNesting(json, listLevelMax);
                    editor.commands.setContent(trimmed);
                    return;
                }
            }

            const content = editor.getJSON();
            contentEmittedByEditor.current.push(content);
            onChange?.(content);
        },
    });

    // useEditor applies its content once, at creation, so content set from outside needs re-syncing here.
    useEffect(() => {
        if (!editor) {
            return;
        }

        // React can render a keystroke's state after later keystrokes already reached the editor, so
        // applying anything the editor emitted itself would undo those later keystrokes.
        const emittedIndex = contentEmittedByEditor.current.indexOf(value);
        if (emittedIndex >= 0) {
            contentEmittedByEditor.current.splice(0, emittedIndex + 1);
            return;
        }

        contentEmittedByEditor.current.length = 0;

        if (deepEqual(value, editor.getJSON())) {
            return;
        }

        // setContent replaces the whole document, which moves the caret to the end.
        const { from, to } = editor.state.selection;
        editor.commands.setContent(value, { emitUpdate: false });
        editor.commands.setTextSelection({ from, to });
    }, [editor, value]);

    const translationContext = useContentTranslationService();
    const canTranslate = translationContext.enabled && resolvedOptions.contentTranslation;
    const [translationDialogState, setTranslationDialogState] = useState<{ original: JSONContent; translated: JSONContent } | null>(null);
    const errorDialog = useErrorDialog();

    if (!editor) {
        return null;
    }

    async function handleTranslateClick() {
        try {
            const original = editor.getJSON();
            const translated = await translateTipTapContent(original, translationContext.translate, { resolvedOptions, extensions });
            if (translationContext.showApplyTranslationDialog) {
                setTranslationDialogState({ original, translated });
            } else {
                editor.commands.setContent(translated);
            }
        } catch (error) {
            errorDialog?.showError({
                title: <FormattedMessage id="dextinity.translator.error.title" defaultMessage="Translation failed" />,
                userMessage: (
                    <FormattedMessage
                        id="dextinity.translator.error.message"
                        defaultMessage="An error occurred while translating the content. Please try again."
                    />
                ),
                error: error instanceof Error ? error.message : "Translation failed",
            });
        }
    }

    const editorNode = <EditorContent editor={editor} />;

    return (
        <TextBlockContext.Provider value={textBlockContextValue}>
            <InlineStyleContext.Provider value={resolvedOptions.inlineStyles}>
                {readOnly ? (
                    <ReadOnlyContent>{editorNode}</ReadOnlyContent>
                ) : (
                    <Box sx={{ border: `1px solid ${greyPalette[100]}`, borderTopWidth: 0, backgroundColor: "white", borderRadius: "2px" }}>
                        <TipTapRichTextEditorToolbar
                            editor={editor}
                            resolvedOptions={resolvedOptions}
                            canTranslate={canTranslate}
                            onTranslateClick={handleTranslateClick}
                        />
                        <Box sx={{ "& .tiptap": { minHeight, p: "20px", outline: "none" } }}>{editorNode}</Box>
                    </Box>
                )}
                {translationDialogState && (
                    <ContentTranslationDialog
                        open
                        onClose={() => setTranslationDialogState(null)}
                        originalContent={translationDialogState.original}
                        translatedContent={translationDialogState.translated}
                        onApplyTranslation={(content) => {
                            editor.commands.setContent(content);
                            setTranslationDialogState(null);
                        }}
                        resolvedOptions={resolvedOptions}
                    />
                )}
            </InlineStyleContext.Provider>
        </TextBlockContext.Provider>
    );
};
