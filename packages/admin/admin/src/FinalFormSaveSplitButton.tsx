import { ChevronDown } from "@dextinity/admin-icons";
import type { PropsWithChildren } from "react";
import { useForm, useFormState } from "react-final-form";
import { FormattedMessage } from "react-intl";

import { SaveButton } from "./common/buttons/SaveButton";
import { SplitButton, type SplitButtonProps } from "./common/buttons/split/SplitButton";
import { FinalFormSubmitEvent } from "./FinalForm";
import { messages } from "./messages";
import { useStackApi } from "./stack/Api";

interface FormSaveButtonProps {
    localStorageKey?: string;
    hasConflict?: boolean;
}

/**
 * @deprecated Use `FinalFormSaveButton` instead as we are retiring the SplitButton pattern.
 */
export const FinalFormSaveSplitButton = ({ localStorageKey = "SaveSplitButton", hasConflict = false }: PropsWithChildren<FormSaveButtonProps>) => {
    const stackApi = useStackApi();
    const form = useForm();
    const { pristine, hasValidationErrors, submitting, hasSubmitErrors } = useFormState();

    const setSubmitEvent = form.mutators.setSubmitEvent
        ? form.mutators.setSubmitEvent
        : () => {
              console.warn(`Can't set submitEvent, as the setSubmitEvent mutator is missing. Did you forget to add the mutator to the form?`);
          };

    const splitButtonProps: Partial<SplitButtonProps> = {};
    if (hasConflict) {
        splitButtonProps.selectIcon = (
            <ChevronDown
                sx={(theme) => ({
                    color: theme.palette.error.contrastText,
                })}
            />
        );
    }
    return (
        <SplitButton
            {...splitButtonProps}
            disabled={pristine || hasValidationErrors || submitting}
            localStorageKey={localStorageKey}
            slotProps={{
                activeButton: {
                    variant: "contained",
                    color: hasConflict ? "error" : "primary",
                    sx: ({ palette }) => ({
                        borderLeft: `1px solid ${palette.primary.dark}`,

                        "&.Mui-disabled": {
                            borderLeftColor: palette.grey[200],
                        },
                    }),
                },
            }}
        >
            <SaveButton
                loading={submitting}
                hasErrors={hasSubmitErrors || hasConflict}
                tooltipErrorMessage={hasConflict ? <FormattedMessage {...messages.saveConflict} /> : undefined}
                onClick={async () => {
                    const event = new FinalFormSubmitEvent("submit");
                    event.navigatingBack = false;
                    setSubmitEvent(event);
                    await form.submit();
                    setSubmitEvent(undefined);
                }}
            >
                <FormattedMessage {...messages.save} />
            </SaveButton>
            <SaveButton
                loading={submitting}
                hasErrors={hasSubmitErrors}
                onClick={async () => {
                    const event = new FinalFormSubmitEvent("submit");
                    event.navigatingBack = true;
                    setSubmitEvent(event);
                    const submitReturn = await form.submit();
                    setSubmitEvent(undefined);
                    const successful = submitReturn === undefined || Object.keys(submitReturn).length == 0;
                    if (successful) {
                        stackApi?.goBack();
                    }
                }}
            >
                <FormattedMessage {...messages.saveAndGoBack} />
            </SaveButton>
        </SplitButton>
    );
};
