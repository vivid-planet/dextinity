import { InputField, type InputFieldProps, TextareaField, type TextareaFieldProps } from "@dextinity/ui-react-final-form";

import { useContentTranslationFieldActions } from "./useContentTranslationFieldActions";

interface ContentTranslationProps {
    /**
     * Hides the "Translate" action, e.g. for content that isn't language-specific like codes or URLs.
     *
     * @defaultValue `false`
     */
    disableContentTranslation?: boolean;
}

export type BlockInputFieldProps = InputFieldProps & ContentTranslationProps;

/**
 * An `InputField` for block forms that offers translating its content with the content translation service.
 */
export function BlockInputField({ disableContentTranslation = false, actions, ...props }: BlockInputFieldProps) {
    const translationActions = useContentTranslationFieldActions({ disabled: disableContentTranslation || props.disabled || props.readOnly });
    return <InputField {...props} actions={actions ?? translationActions} />;
}

export type BlockTextareaFieldProps = TextareaFieldProps & ContentTranslationProps;

/**
 * A `TextareaField` for block forms that offers translating its content with the content translation service.
 */
export function BlockTextareaField({ disableContentTranslation = false, actions, ...props }: BlockTextareaFieldProps) {
    const translationActions = useContentTranslationFieldActions({ disabled: disableContentTranslation || props.disabled || props.readOnly });
    return <TextareaField {...props} actions={actions ?? translationActions} />;
}
