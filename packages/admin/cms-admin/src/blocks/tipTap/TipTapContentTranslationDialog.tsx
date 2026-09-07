import { BaseTranslationDialog } from "@dextinity/admin";
import type { JSONContent } from "@tiptap/react";

import { TipTapEditor, type TipTapEditorProps } from "./createTipTapRichTextBlock";

interface TipTapContentTranslationDialogProps {
    open: boolean;
    onClose: () => void;
    originalContent: JSONContent;
    translatedContent: JSONContent;
    onApplyTranslation: (content: JSONContent) => void;
    editorProps: Pick<
        TipTapEditorProps,
        | "supports"
        | "textBlockStyles"
        | "inlineStyles"
        | "placeholders"
        | "linkBlock"
        | "childBlocks"
        | "maxTextBlocks"
        | "listLevelMax"
        | "headingLevels"
    >;
}

export const TipTapContentTranslationDialog = ({
    open,
    onClose,
    originalContent,
    translatedContent,
    onApplyTranslation,
    editorProps,
}: TipTapContentTranslationDialogProps) => (
    <BaseTranslationDialog
        open={open}
        onClose={onClose}
        originalText={originalContent}
        translatedText={translatedContent}
        onApplyTranslation={onApplyTranslation}
        renderOriginalText={(content) => <TipTapEditor state={{ tipTapContent: content }} updateState={() => {}} {...editorProps} readOnly />}
        renderTranslatedText={(content, onChange) => (
            <TipTapEditor
                state={{ tipTapContent: content }}
                updateState={(next) => {
                    const nextState = typeof next === "function" ? next({ tipTapContent: content }) : next;
                    onChange(nextState.tipTapContent);
                }}
                {...editorProps}
                disableContentTranslation
            />
        )}
    />
);
