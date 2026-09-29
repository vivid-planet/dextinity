import { Translate } from "@dextinity/admin-icons";
import { IconButton, InputBase, type InputBaseProps } from "@mui/material";
import { useState } from "react";
import type { FieldRenderProps } from "react-final-form";
import { FormattedMessage } from "react-intl";

import { ClearInputAdornment } from "../common/ClearInputAdornment";
import { Tooltip } from "../common/Tooltip";
import { PlainTextTranslationDialog } from "../translator/PlainTextTranslationDialog";
import { useContentTranslationService } from "../translator/useContentTranslationService";

export type FinalFormInputProps = InputBaseProps & {
    disableContentTranslation?: boolean;
};

type FinalFormInputInternalProps = FieldRenderProps<string, HTMLInputElement | HTMLTextAreaElement>;

export function FinalFormInput({
    meta,
    input,
    innerRef,
    endAdornment,
    disableContentTranslation,
    required,
    disabled,
    readOnly,
    ...props
}: FinalFormInputProps & FinalFormInputInternalProps) {
    const type = props.type ?? input.type ?? "text";
    const { enabled: translationEnabled, showApplyTranslationDialog, translate } = useContentTranslationService();
    const isTranslatable = translationEnabled && !disableContentTranslation && (type === "text" || type === "textarea") && !props.disabled;

    const [open, setOpen] = useState<boolean>(false);
    const [pendingTranslation, setPendingTranslation] = useState<string | undefined>(undefined);

    const clearable = !required && !disabled && !readOnly;

    return (
        <>
            <InputBase
                {...input}
                {...props}
                required={required}
                disabled={disabled}
                readOnly={readOnly}
                endAdornment={
                    (endAdornment || clearable || isTranslatable) && (
                        <>
                            {clearable && input.value && <ClearInputAdornment position="end" onClick={() => input.onChange("")} />}
                            {isTranslatable && (
                                <Tooltip title={<FormattedMessage id="dextinity.translate" defaultMessage="Translate" />}>
                                    <IconButton
                                        onClick={async () => {
                                            if (showApplyTranslationDialog) {
                                                setPendingTranslation(await translate(input.value));
                                                setOpen(true);
                                            } else {
                                                input.onChange(await translate(input.value));
                                            }
                                        }}
                                    >
                                        <Translate />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {endAdornment}
                        </>
                    )
                }
            />
            {open && pendingTranslation && (
                <PlainTextTranslationDialog
                    open={open}
                    onClose={() => setOpen(false)}
                    originalText={input.value}
                    translatedText={pendingTranslation}
                    onApplyTranslation={input.onChange}
                    multiline={props.multiline}
                />
            )}
        </>
    );
}
