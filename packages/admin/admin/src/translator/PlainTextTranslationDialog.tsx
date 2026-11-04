import { TextField } from "@mui/material";

import { BaseTranslationDialog } from "./BaseTranslationDialog";

interface PlainTextTranslationDialogProps {
    open: boolean;
    onClose: () => void;
    originalText: string;
    translatedText: string;
    onApplyTranslation: (value: string) => void;
    multiline?: boolean;
}

export const PlainTextTranslationDialog = (props: PlainTextTranslationDialogProps) => {
    const { open, onClose, originalText, translatedText, onApplyTranslation, multiline } = props;

    return (
        <BaseTranslationDialog
            open={open}
            onClose={onClose}
            originalText={originalText}
            translatedText={translatedText}
            onApplyTranslation={onApplyTranslation}
            renderOriginalText={(text) => <TextField value={text} disabled fullWidth multiline={multiline} rows={multiline ? 3 : undefined} />}
            renderTranslatedText={(text, onChange) => (
                <TextField
                    value={text}
                    onChange={(event) => onChange(event.target.value)}
                    fullWidth
                    multiline={multiline}
                    rows={multiline ? 3 : undefined}
                />
            )}
        />
    );
};
