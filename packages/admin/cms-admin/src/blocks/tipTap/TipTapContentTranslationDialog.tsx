import { messages } from "@dextinity/admin";
import { Button, Dialog, Typography } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import type { JSONContent } from "@tiptap/react";
import { useState } from "react";
import { useIntl } from "react-intl";

import { TipTapEditor, type TipTapEditorProps } from "./createTipTapRichTextBlock";

interface TipTapContentTranslationDialogProps {
    onClose: () => void;
    originalContent: JSONContent;
    translatedContent: JSONContent;
    onApplyTranslation: (content: JSONContent) => void;
    editorProps: Pick<
        TipTapEditorProps,
        "resolvedOptions" | "inlineStyles" | "placeholders" | "linkBlock" | "childBlocks" | "maxTextBlocks" | "listLevelMax" | "minHeight"
    >;
}

export const TipTapContentTranslationDialog = ({
    onClose,
    originalContent,
    translatedContent,
    onApplyTranslation,
    editorProps,
}: TipTapContentTranslationDialogProps) => {
    const intl = useIntl();
    const [translation, setTranslation] = useState(translatedContent);
    const translationLabel = intl.formatMessage({ id: "dextinity.translator.translation", defaultMessage: "Translation" });

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            size="large"
            title={translationLabel}
            labels={{ close: intl.formatMessage({ id: "dextinity.generic.close", defaultMessage: "Close" }) }}
            footer={
                <>
                    <Button variant="text" color="secondary" onClick={onClose}>
                        {intl.formatMessage(messages.cancel)}
                    </Button>
                    <Button
                        onClick={() => {
                            onApplyTranslation(translation);
                            onClose();
                        }}
                    >
                        {intl.formatMessage(messages.apply)}
                    </Button>
                </>
            }
        >
            <Columns>
                <Column>
                    <Typography variant="label" element="h3">
                        {intl.formatMessage({ id: "dextinity.translator.original", defaultMessage: "Original" })}
                    </Typography>
                    <TipTapEditor state={{ tipTapContent: originalContent }} updateState={() => {}} {...editorProps} readOnly />
                </Column>
                <Column>
                    <Typography variant="label" element="h3">
                        {translationLabel}
                    </Typography>
                    <TipTapEditor
                        state={{ tipTapContent: translation }}
                        updateState={(next) => {
                            const nextState = typeof next === "function" ? next({ tipTapContent: translation }) : next;
                            setTranslation(nextState.tipTapContent);
                        }}
                        {...editorProps}
                        resolvedOptions={{ ...editorProps.resolvedOptions, contentTranslation: false }}
                    />
                </Column>
            </Columns>
        </Dialog>
    );
};

const Columns = styled("div")`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--dextinity-space-6);
`;

const Column = styled("div")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-space-2);
    min-inline-size: 0;
`;
