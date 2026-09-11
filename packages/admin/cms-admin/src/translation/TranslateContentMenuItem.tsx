import { CrudMoreActionsMenuItem, useContentTranslationService, useErrorDialog } from "@dextinity/admin";
import { Translate } from "@dextinity/admin-icons";
import { CircularProgress, ListItemIcon, ListItemText } from "@mui/material";
import { useState } from "react";
import { FormattedMessage } from "react-intl";

interface Props {
    translateContent: (batchTranslate: (texts: string[]) => Promise<string[]>) => Promise<void>;
    disabled?: boolean;
}

export const TranslateContentMenuItem = ({ translateContent, disabled }: Props) => {
    const { enabled, translate, batchTranslate } = useContentTranslationService();
    const errorDialog = useErrorDialog();
    const [translating, setTranslating] = useState(false);

    if (!enabled) {
        return null;
    }

    const effectiveBatchTranslate = batchTranslate ?? (async (texts: string[]) => Promise.all(texts.map(translate)));

    const handleTranslate = async () => {
        setTranslating(true);

        try {
            await translateContent(effectiveBatchTranslate);
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
        } finally {
            setTranslating(false);
        }
    };

    return (
        <CrudMoreActionsMenuItem disabled={disabled || translating} onClick={handleTranslate}>
            <ListItemIcon>{translating ? <CircularProgress size={16} /> : <Translate />}</ListItemIcon>
            <ListItemText primary={<FormattedMessage id="dextinity.translator.translate" defaultMessage="Translate" />} />
        </CrudMoreActionsMenuItem>
    );
};
