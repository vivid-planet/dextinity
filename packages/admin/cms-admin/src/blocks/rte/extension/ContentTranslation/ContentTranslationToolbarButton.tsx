import { messages, useContentTranslationService, useErrorDialog } from "@dextinity/admin";
import { Translate } from "@dextinity/admin-icons";
import { ControlButton, htmlToState, type IRteOptions, Rte, RteReadOnly, stateToHtml } from "@dextinity/admin-rte";
import { Button, Dialog, Tooltip, Typography } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import type { EditorState } from "draft-js";
import { type MouseEvent, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { RteDesignSystemTheme } from "../../RteDesignSystemTheme";

interface ContentTranslationToolbarButtonProps {
    editorState: EditorState;
    setEditorState: (editorState: EditorState) => void;
    options: IRteOptions;
}

/**
 * The Draft.js toolbar button that translates the content with the content translation service, with the dialog to review the translation
 * built with `@dextinity/ui`.
 */
export function ContentTranslationToolbarButton({ editorState, setEditorState, options }: ContentTranslationToolbarButtonProps) {
    const intl = useIntl();
    const { translate, showApplyTranslationDialog } = useContentTranslationService();
    const errorDialog = useErrorDialog();
    const [pendingTranslation, setPendingTranslation] = useState<EditorState>();
    const translateLabel = intl.formatMessage({ id: "dextinity.rte.translation.buttonTooltip", defaultMessage: "Translate" });

    const handleClick = async (event: MouseEvent) => {
        event.preventDefault();
        const { html, entities } = stateToHtml({ editorState, options });
        let translatedEditorState: EditorState;
        try {
            translatedEditorState = htmlToState({ html: await translate(html), entities });
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
            return;
        }
        if (showApplyTranslationDialog) {
            setPendingTranslation(translatedEditorState);
        } else {
            setEditorState(translatedEditorState);
        }
    };

    return (
        <>
            <Tooltip content={translateLabel}>
                <span>
                    <ControlButton
                        icon={Translate}
                        onButtonClick={(event) => void handleClick(event)}
                        slotProps={{ root: { "aria-label": translateLabel } }}
                    />
                </span>
            </Tooltip>
            {pendingTranslation != null && (
                <ContentTranslationDialog
                    originalEditorState={editorState}
                    translatedEditorState={pendingTranslation}
                    options={options}
                    onApply={setEditorState}
                    onClose={() => setPendingTranslation(undefined)}
                />
            )}
        </>
    );
}

interface ContentTranslationDialogProps {
    options: IRteOptions;
    originalEditorState: EditorState;
    translatedEditorState: EditorState;
    onApply: (editorState: EditorState) => void;
    onClose: () => void;
}

function ContentTranslationDialog({ options, originalEditorState, translatedEditorState, onApply, onClose }: ContentTranslationDialogProps) {
    const intl = useIntl();
    const [translation, setTranslation] = useState(translatedEditorState);
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
                            onApply(translation);
                            onClose();
                        }}
                    >
                        {intl.formatMessage(messages.apply)}
                    </Button>
                </>
            }
        >
            <RteDesignSystemTheme>
                <Columns>
                    <Column>
                        <Typography variant="label" element="h3">
                            {intl.formatMessage({ id: "dextinity.translator.original", defaultMessage: "Original" })}
                        </Typography>
                        <RteReadOnly value={originalEditorState} />
                    </Column>
                    <Column>
                        <Typography variant="label" element="h3">
                            {translationLabel}
                        </Typography>
                        <Rte value={translation} onChange={setTranslation} options={{ ...options, disableContentTranslation: true }} />
                    </Column>
                </Columns>
            </RteDesignSystemTheme>
        </Dialog>
    );
}

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
