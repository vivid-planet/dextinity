import { useContentTranslationService, useErrorDialog } from "@dextinity/admin";
import { FieldActions } from "@dextinity/ui";
import type { FieldAdapterActions } from "@dextinity/ui-react-final-form";
import { FormattedMessage, useIntl } from "react-intl";

/**
 * The `actions` of a text field adapter that translate its content with the content translation service: in place, or offered to accept
 * or discard when the service asks to review translations. `undefined` while the service is disabled.
 */
export function useContentTranslationFieldActions({ disabled = false }: { disabled?: boolean } = {}): FieldAdapterActions<string> | undefined {
    const intl = useIntl();
    const { enabled, showApplyTranslationDialog, translate } = useContentTranslationService();
    const errorDialog = useErrorDialog();

    if (!enabled || disabled) {
        return undefined;
    }

    const labels = {
        translate: intl.formatMessage({ id: "dextinity.translate", defaultMessage: "Translate" }),
        translation: intl.formatMessage({ id: "dextinity.translator.translation", defaultMessage: "Translation" }),
        accept: intl.formatMessage({ id: "dextinity.translator.accept", defaultMessage: "Accept" }),
        discard: intl.formatMessage({ id: "dextinity.translator.discard", defaultMessage: "Discard" }),
    };

    function showTranslationError(error: unknown) {
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

    return ({ value, setValue }) =>
        showApplyTranslationDialog ? (
            <FieldActions
                translate
                labels={labels}
                onTranslateSuggest={() => translate(value)}
                onTranslateAccept={setValue}
                onTranslateError={showTranslationError}
            />
        ) : (
            <FieldActions
                translate
                labels={labels}
                onTranslate={async () => setValue(await translate(value))}
                onTranslateError={showTranslationError}
            />
        );
}
