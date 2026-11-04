import type { ReactNode } from "react";
import { useForm, useFormState } from "react-final-form";
import { FormattedMessage } from "react-intl";

import { SaveButton } from "./common/buttons/SaveButton";
import { messages } from "./messages";

interface FinalFormSaveButtonProps {
    message?: ReactNode;
    hasConflict?: boolean;
}

export const FinalFormSaveButton = ({ message = <FormattedMessage {...messages.save} />, hasConflict }: FinalFormSaveButtonProps) => {
    const form = useForm();
    const { pristine, hasValidationErrors, submitting, hasSubmitErrors } = useFormState();

    const isDisabled = pristine || hasValidationErrors || submitting;

    return (
        <SaveButton
            hasErrors={hasConflict || hasSubmitErrors}
            tooltipErrorMessage={hasConflict ? <FormattedMessage {...messages.saveConflict} /> : undefined}
            disabled={isDisabled}
            loading={submitting}
            onClick={() => {
                if (!isDisabled) {
                    form.submit();
                }
            }}
        >
            {message}
        </SaveButton>
    );
};
