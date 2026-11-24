import type { JSONContent } from "@tiptap/react";

import { BaseTranslationDialog } from "../translator/BaseTranslationDialog";
import type { TipTapResolvedOptions } from "./options";
import { ResolvedTipTapRichTextEditor } from "./TipTapRichTextEditor";

interface ContentTranslationDialogProps {
    open: boolean;
    onClose: () => void;
    originalContent: JSONContent;
    translatedContent: JSONContent;
    onApplyTranslation: (content: JSONContent) => void;
    resolvedOptions: TipTapResolvedOptions;
}

export const ContentTranslationDialog = ({
    open,
    onClose,
    originalContent,
    translatedContent,
    onApplyTranslation,
    resolvedOptions,
}: ContentTranslationDialogProps) => (
    <BaseTranslationDialog
        open={open}
        onClose={onClose}
        originalText={originalContent}
        translatedText={translatedContent}
        onApplyTranslation={onApplyTranslation}
        renderOriginalText={(content) => <ResolvedTipTapRichTextEditor value={content} resolvedOptions={resolvedOptions} readOnly />}
        renderTranslatedText={(content, onChange) => (
            <ResolvedTipTapRichTextEditor value={content} onChange={onChange} resolvedOptions={{ ...resolvedOptions, contentTranslation: false }} />
        )}
    />
);
