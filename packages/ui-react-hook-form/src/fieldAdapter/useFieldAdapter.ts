import { type ReactNode, type Ref, useMemo } from "react";
import { type FieldPath, type FieldValues, useController, type UseControllerProps, type Validate } from "react-hook-form";

import { useFieldAdapterConfig } from "../fieldAdapterConfig/FieldAdapterConfigProvider";
import { mergeRefs } from "../utils/mergeRefs";
import { fieldValidationProps } from "./fieldValidationProps";
import { focusTarget } from "./focusTarget";
import type { ReactHookFormFieldConfig } from "./reactHookFormFieldConfig";

const defaultRequiredMessage = "Required";
const requiredRuleKey = "required";

export function isEmptyValue(value: unknown) {
    return value === undefined || value === null || value === "" || value === false || (Array.isArray(value) && value.length === 0);
}

type Rules<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = UseControllerProps<TFieldValues, TName>["rules"];

// React Hook Form keeps only string messages, so the required rule fails without one and the adapter shows `requiredMessage` for it
export function withRequiredRule<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
    rules: Rules<TFieldValues, TName>,
    required: boolean,
    isEmpty: (value: unknown) => boolean,
): Rules<TFieldValues, TName> {
    if (!required) {
        return rules;
    }
    const validate = rules?.validate;
    const otherValidations = typeof validate === "function" ? { validate } : (validate ?? {});
    const requiredValidation: Validate<unknown, TFieldValues> = (value) => !isEmpty(value);
    return { ...rules, validate: { [requiredRuleKey]: requiredValidation, ...otherValidations } } as Rules<TFieldValues, TName>;
}

export function toErrorMessage(error: { type?: string; message?: string } | undefined, requiredMessage: ReactNode): ReactNode {
    if (error == null) {
        return undefined;
    }
    if (error.message) {
        return error.message;
    }
    return error.type === requiredRuleKey ? requiredMessage : undefined;
}

export interface UseFieldAdapterOptions<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> extends ReactHookFormFieldConfig<
    TFieldValues,
    TName
> {
    name: TName;
    required?: boolean;
    requiredMessage?: ReactNode;
    isEmpty?: (value: unknown) => boolean;
}

export function useFieldAdapter<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>, Element extends HTMLElement>(
    {
        name,
        control,
        rules,
        defaultValue,
        shouldUnregister,
        warn,
        required = false,
        requiredMessage = defaultRequiredMessage,
        isEmpty = isEmptyValue,
    }: UseFieldAdapterOptions<TFieldValues, TName>,
    forwardedRef: Ref<Element> | undefined,
) {
    const adapterConfig = useFieldAdapterConfig();
    const { field, fieldState, formState } = useController<TFieldValues, TName>({
        name,
        control,
        rules: withRequiredRule<TFieldValues, TName>(rules, required, isEmpty),
        defaultValue,
        shouldUnregister,
    });

    // A rule without a message, e.g. `{ maxLength: 10 }`, still blocks submitting, so the field shows as invalid even without a text
    const validationProps = fieldValidationProps({
        hasError: fieldState.error != null,
        error: toErrorMessage(fieldState.error, requiredMessage),
        warning: warn?.(field.value),
        touchedOrSubmitted: fieldState.isTouched || formState.isSubmitted,
        config: adapterConfig,
    });

    const fieldRef = field.ref;
    const ref = useMemo(
        () =>
            mergeRefs<Element>(forwardedRef, (element) => {
                // The ui components' roots aren't always focusable, so React Hook Form gets the element inside to focus on an error
                fieldRef(element == null ? null : { focus: () => focusTarget(element)?.focus() });
            }),
        [forwardedRef, fieldRef],
    );

    return { field, validationProps, ref };
}
